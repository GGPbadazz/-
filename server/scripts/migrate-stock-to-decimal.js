const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database', 'inventory.db');
const db = new Database(dbPath);

console.log('🔄 开始数据库迁移：将stock字段从INTEGER改为DECIMAL...');

try {
    // 禁用外键约束
    db.exec('PRAGMA foreign_keys = OFF');
    
    // 开始事务
    db.exec('BEGIN TRANSACTION');

    // 1. 创建新的products表（带有DECIMAL类型的stock字段）
    console.log('📋 创建新的products表结构...');
    db.exec(`
        CREATE TABLE products_new (
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
            price DECIMAL(10,2) DEFAULT 0,
            current_unit_price DECIMAL(10,2) DEFAULT 0,
            total_cost_value DECIMAL(10,2) DEFAULT 0,
            barcode_image TEXT,
            qr_code_image TEXT,
            barcode_updated_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories (id)
        )
    `);

    // 2. 复制所有数据到新表
    console.log('📦 复制现有数据到新表...');
    db.exec(`
        INSERT INTO products_new 
        SELECT * FROM products
    `);

    // 3. 删除旧表
    console.log('🗑️  删除旧的products表...');
    db.exec('DROP TABLE products');

    // 4. 重命名新表
    console.log('🔄 重命名新表为products...');
    db.exec('ALTER TABLE products_new RENAME TO products');

    // 5. 重新创建索引
    console.log('📊 重新创建索引...');
    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
        CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
        CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
    `);

    // 提交事务
    db.exec('COMMIT');
    
    // 重新启用外键约束
    db.exec('PRAGMA foreign_keys = ON');

    console.log('✅ 数据库迁移完成！stock字段现在支持小数值');

    // 验证迁移结果
    const tableInfo = db.prepare('PRAGMA table_info(products)').all();
    const stockColumn = tableInfo.find(col => col.name === 'stock');
    console.log('📋 迁移后的stock字段类型:', stockColumn.type);

    // 显示产品数量
    const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
    console.log('📊 迁移后的产品数量:', productCount.count);

} catch (error) {
    // 如果出错，回滚事务
    console.error('❌ 迁移失败，正在回滚...', error);
    db.exec('ROLLBACK');
    throw error;
} finally {
    db.close();
}
