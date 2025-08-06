const db = require('../database/connection');

// Create monthly inventory snapshot table
const createMonthlySnapshotTable = () => {
    console.log('Starting to create monthly inventory snapshot table...');
    
    try {
        const createTableSQL = `
            CREATE TABLE IF NOT EXISTS monthly_stock_snapshots (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                year INTEGER NOT NULL,
                month INTEGER NOT NULL,
                product_id INTEGER NOT NULL,
                
                -- End-of-month inventory information (becomes next month's opening)
                ending_stock DECIMAL(10,3) NOT NULL DEFAULT 0,
                ending_unit_price FLOAT NOT NULL DEFAULT 0,
                ending_stock_value FLOAT NOT NULL DEFAULT 0,
                
                -- Monthly transaction summary statistics
                in_quantity DECIMAL(10,3) NOT NULL DEFAULT 0,
                out_quantity DECIMAL(10,3) NOT NULL DEFAULT 0,
                net_quantity DECIMAL(10,3) NOT NULL DEFAULT 0,
                total_in_value FLOAT NOT NULL DEFAULT 0,
                total_out_value FLOAT NOT NULL DEFAULT 0,
                net_value FLOAT NOT NULL DEFAULT 0,
                transaction_count INTEGER NOT NULL DEFAULT 0,
                
                -- Product information snapshot (prevent product info changes from affecting historical data)
                product_name VARCHAR(255) NOT NULL,
                product_barcode VARCHAR(100),
                category_id INTEGER NOT NULL,
                category_name VARCHAR(100) NOT NULL,
                
                -- Snapshot timestamp
                snapshot_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                
                -- Unique constraint: only one record per product per month
                UNIQUE(year, month, product_id),
                
                -- Foreign key constraints
                FOREIGN KEY (product_id) REFERENCES products (id),
                FOREIGN KEY (category_id) REFERENCES categories (id)
            )
        `;
        
        db.prepare(createTableSQL).run();
        console.log('✅ Monthly inventory snapshot table created successfully');
        
        // 创建索引优化查询性能
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_monthly_snapshots_year_month ON monthly_stock_snapshots(year, month)',
            'CREATE INDEX IF NOT EXISTS idx_monthly_snapshots_product ON monthly_stock_snapshots(product_id)',
            'CREATE INDEX IF NOT EXISTS idx_monthly_snapshots_year_month_product ON monthly_stock_snapshots(year, month, product_id)',
            'CREATE INDEX IF NOT EXISTS idx_monthly_snapshots_category ON monthly_stock_snapshots(category_id)',
            'CREATE INDEX IF NOT EXISTS idx_monthly_snapshots_date ON monthly_stock_snapshots(snapshot_date)'
        ];
        
        indexes.forEach((indexSQL, index) => {
            db.prepare(indexSQL).run();
            console.log(`✅ 索引 ${index + 1}/5 创建成功`);
        });
        
        console.log('🎉 月度快照表和索引创建完成');
        
    } catch (error) {
        console.error('❌ 创建快照表失败:', error);
        throw error;
    }
};

// 验证表结构
const verifySnapshotTable = () => {
    try {
        const tableInfo = db.prepare("PRAGMA table_info(monthly_stock_snapshots)").all();
        console.log('\n📋 快照表结构验证:');
        console.log('字段数量:', tableInfo.length);
        
        const indexInfo = db.prepare("PRAGMA index_list(monthly_stock_snapshots)").all();
        console.log('索引数量:', indexInfo.length);
        
        return true;
    } catch (error) {
        console.error('❌ 表结构验证失败:', error);
        return false;
    }
};

// 如果直接运行此脚本
if (require.main === module) {
    createMonthlySnapshotTable();
    verifySnapshotTable();
} else {
    module.exports = { 
        createMonthlySnapshotTable,
        verifySnapshotTable 
    };
}
