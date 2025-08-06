const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '../database/inventory.db');
const db = new Database(dbPath);

console.log('🔄 开始数据库迁移：修改数值字段类型为适当的DECIMAL和FLOAT...');

const migrate = () => {
    try {
        // 禁用外键约束
        console.log('🔓 禁用外键约束...');
        db.exec('PRAGMA foreign_keys = OFF;');
        
        // 开始事务
        const transaction = db.transaction(() => {
            
            // 1. 备份transactions表
            console.log('📋 备份transactions表...');
            db.exec(`
                CREATE TABLE transactions_backup AS 
                SELECT * FROM transactions;
            `);
            
            // 2. 删除原transactions表
            console.log('🗑️ 删除原transactions表...');
            db.exec('DROP TABLE transactions;');
            
            // 3. 创建新的transactions表（修正字段类型）
            console.log('🏗️ 创建新的transactions表...');
            db.exec(`
                CREATE TABLE transactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    product_id INTEGER NOT NULL,
                    type TEXT NOT NULL CHECK (type IN ('IN', 'OUT')),
                    quantity DECIMAL(10,3) NOT NULL,
                    unit_price FLOAT DEFAULT 0,
                    total_price FLOAT DEFAULT 0,
                    requester_name TEXT,
                    requester_department TEXT,
                    project_id INTEGER,
                    purpose TEXT,
                    signature TEXT,
                    stock_before DECIMAL(10,3) DEFAULT 0,
                    stock_after DECIMAL(10,3) DEFAULT 0,
                    stock_unit_price FLOAT DEFAULT 0,
                    stock_value FLOAT DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (product_id) REFERENCES products (id),
                    FOREIGN KEY (project_id) REFERENCES projects (id)
                );
            `);
            
            // 4. 将数据从备份表复制到新表
            console.log('📋 复制数据到新transactions表...');
            db.exec(`
                INSERT INTO transactions (
                    id, product_id, type, quantity, unit_price, total_price,
                    requester_name, requester_department, project_id, purpose, signature,
                    stock_before, stock_after, stock_unit_price, stock_value, created_at
                )
                SELECT 
                    id, product_id, type, 
                    CAST(quantity AS DECIMAL(10,3)), 
                    CAST(COALESCE(unit_price, 0) AS FLOAT),
                    CAST(COALESCE(total_price, 0) AS FLOAT),
                    requester_name, requester_department, project_id, purpose, signature,
                    CAST(COALESCE(stock_before, 0) AS DECIMAL(10,3)),
                    CAST(COALESCE(stock_after, 0) AS DECIMAL(10,3)),
                    CAST(COALESCE(stock_unit_price, 0) AS FLOAT),
                    CAST(COALESCE(stock_value, 0) AS FLOAT),
                    created_at
                FROM transactions_backup;
            `);
            
            // 5. 删除备份表
            console.log('🗑️ 删除备份表...');
            db.exec('DROP TABLE transactions_backup;');
            
            // 6. 修改products表中的价格字段为FLOAT（如果需要）
            console.log('🔄 修改products表价格字段...');
            
            // 备份products表
            db.exec(`
                CREATE TABLE products_backup AS 
                SELECT * FROM products;
            `);
            
            // 删除原products表
            db.exec('DROP TABLE products;');
            
            // 创建新的products表
            db.exec(`
                CREATE TABLE products (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    name_en TEXT,
                    barcode TEXT UNIQUE,
                    category_id INTEGER,
                    location TEXT,
                    supplier TEXT,
                    description TEXT,
                    stock DECIMAL(10,3) DEFAULT 0,
                    min_stock DECIMAL(10,3) DEFAULT 0,
                    price FLOAT DEFAULT 0,
                    current_unit_price FLOAT DEFAULT 0,
                    total_cost_value FLOAT DEFAULT 0,
                    barcode_image TEXT,
                    qr_code_image TEXT,
                    barcode_updated_at DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (category_id) REFERENCES categories (id)
                );
            `);
            
            // 复制数据到新products表
            db.exec(`
                INSERT INTO products (
                    id, name, name_en, barcode, category_id, location, supplier, description,
                    stock, min_stock, price, current_unit_price, total_cost_value,
                    barcode_image, qr_code_image, barcode_updated_at, created_at, updated_at
                )
                SELECT 
                    id, name, name_en, barcode, category_id, location, supplier, description,
                    CAST(stock AS DECIMAL(10,3)), 
                    CAST(min_stock AS DECIMAL(10,3)),
                    CAST(price AS FLOAT),
                    CAST(current_unit_price AS FLOAT),
                    CAST(total_cost_value AS FLOAT),
                    barcode_image, qr_code_image, barcode_updated_at, created_at, updated_at
                FROM products_backup;
            `);
            
            // 删除备份表
            db.exec('DROP TABLE products_backup;');
            
            // 7. 修改monthly_stock_snapshots表
            console.log('🔄 修改monthly_stock_snapshots表...');
            
            // 检查表是否存在
            const tableExists = db.prepare(`
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='monthly_stock_snapshots'
            `).get();
            
            if (tableExists) {
                // 备份monthly_stock_snapshots表
                db.exec(`
                    CREATE TABLE monthly_stock_snapshots_backup AS 
                    SELECT * FROM monthly_stock_snapshots;
                `);
                
                // 删除原表
                db.exec('DROP TABLE monthly_stock_snapshots;');
                
                // 创建新的monthly_stock_snapshots表
                db.exec(`
                    CREATE TABLE monthly_stock_snapshots (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        year INTEGER NOT NULL,
                        month INTEGER NOT NULL,
                        product_id INTEGER NOT NULL,
                        
                        -- 期末库存信息（成为下月的期初）
                        ending_stock DECIMAL(10,3) NOT NULL DEFAULT 0,
                        ending_unit_price FLOAT NOT NULL DEFAULT 0,
                        ending_stock_value FLOAT NOT NULL DEFAULT 0,
                        
                        -- 当月交易汇总统计
                        in_quantity DECIMAL(10,3) NOT NULL DEFAULT 0,
                        out_quantity DECIMAL(10,3) NOT NULL DEFAULT 0,
                        net_quantity DECIMAL(10,3) NOT NULL DEFAULT 0,
                        total_in_value FLOAT NOT NULL DEFAULT 0,
                        total_out_value FLOAT NOT NULL DEFAULT 0,
                        net_value FLOAT NOT NULL DEFAULT 0,
                        transaction_count INTEGER NOT NULL DEFAULT 0,
                        
                        -- 产品信息快照（防止产品信息变更影响历史数据）
                        product_name VARCHAR(255) NOT NULL,
                        product_barcode VARCHAR(100),
                        category_id INTEGER NOT NULL,
                        category_name VARCHAR(100) NOT NULL,
                        
                        -- 快照时间戳
                        snapshot_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        
                        -- 唯一约束：每个产品每月只能有一条记录
                        UNIQUE(year, month, product_id),
                        
                        -- 外键约束
                        FOREIGN KEY (product_id) REFERENCES products (id),
                        FOREIGN KEY (category_id) REFERENCES categories (id)
                    )
                `);
                
                // 复制数据到新表（如果有数据的话）
                const hasData = db.prepare(`
                    SELECT COUNT(*) as count FROM monthly_stock_snapshots_backup
                `).get();
                
                if (hasData.count > 0) {
                    db.exec(`
                        INSERT INTO monthly_stock_snapshots (
                            id, year, month, product_id, ending_stock, ending_unit_price, ending_stock_value,
                            in_quantity, out_quantity, net_quantity, total_in_value, total_out_value, net_value,
                            transaction_count, product_name, product_barcode, category_id, category_name,
                            snapshot_date, created_at
                        )
                        SELECT 
                            id, year, month, product_id, 
                            CAST(ending_stock AS DECIMAL(10,3)),
                            CAST(ending_unit_price AS FLOAT),
                            CAST(ending_stock_value AS FLOAT),
                            CAST(in_quantity AS DECIMAL(10,3)),
                            CAST(out_quantity AS DECIMAL(10,3)),
                            CAST(net_quantity AS DECIMAL(10,3)),
                            CAST(total_in_value AS FLOAT),
                            CAST(total_out_value AS FLOAT),
                            CAST(net_value AS FLOAT),
                            transaction_count, product_name, product_barcode, category_id, category_name,
                            snapshot_date, created_at
                        FROM monthly_stock_snapshots_backup;
                    `);
                }
                
                // 删除备份表
                db.exec('DROP TABLE monthly_stock_snapshots_backup;');
                
                // 重建索引
                db.exec(`
                    CREATE INDEX IF NOT EXISTS idx_monthly_snapshots_year_month ON monthly_stock_snapshots(year, month);
                `);
                db.exec(`
                    CREATE INDEX IF NOT EXISTS idx_monthly_snapshots_product ON monthly_stock_snapshots(product_id);
                `);
                db.exec(`
                    CREATE INDEX IF NOT EXISTS idx_monthly_snapshots_year_month_product ON monthly_stock_snapshots(year, month, product_id);
                `);
                db.exec(`
                    CREATE INDEX IF NOT EXISTS idx_monthly_snapshots_category ON monthly_stock_snapshots(category_id);
                `);
                db.exec(`
                    CREATE INDEX IF NOT EXISTS idx_monthly_snapshots_date ON monthly_stock_snapshots(snapshot_date);
                `);
            } else {
                console.log('ℹ️ monthly_stock_snapshots表不存在，跳过迁移');
            }
            
            console.log('✅ 数据库迁移完成');
        });
        
        // 执行事务
        transaction();
        
        // 重新启用外键约束
        console.log('🔒 重新启用外键约束...');
        db.exec('PRAGMA foreign_keys = ON;');
        
        // 验证迁移结果
        console.log('🔍 验证迁移结果...');
        
        // 检查transactions表结构
        const transactionColumns = db.prepare(`
            PRAGMA table_info(transactions)
        `).all();
        
        console.log('📋 transactions表字段信息：');
        transactionColumns.forEach(col => {
            console.log(`  - ${col.name}: ${col.type}`);
        });
        
        // 检查products表结构
        const productColumns = db.prepare(`
            PRAGMA table_info(products)
        `).all();
        
        console.log('📋 products表字段信息：');
        productColumns.forEach(col => {
            console.log(`  - ${col.name}: ${col.type}`);
        });
        
        // 检查数据完整性
        const transactionCount = db.prepare('SELECT COUNT(*) as count FROM transactions').get();
        const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
        
        console.log(`📊 数据完整性检查：`);
        console.log(`  - transactions表记录数: ${transactionCount.count}`);
        console.log(`  - products表记录数: ${productCount.count}`);
        
    } catch (error) {
        console.error('❌ 迁移失败:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
};

// 执行迁移
migrate();

console.log('🎉 数据库字段类型迁移完成！');
console.log('💡 迁移摘要：');
console.log('  - products表: price, current_unit_price, total_cost_value 改为 FLOAT（保留2位小数）');
console.log('  - transactions表: quantity, stock_before, stock_after 改为 DECIMAL(10,3)');
console.log('  - transactions表: unit_price, total_price, stock_unit_price, stock_value 改为 FLOAT');
console.log('  - monthly_stock_snapshots表: 相关字段类型已更新');

// 关闭数据库连接
db.close();
