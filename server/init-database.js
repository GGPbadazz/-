const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'inventory.db');

// 确保database目录存在
const fs = require('fs');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// 创建数据库连接
const db = new Database(dbPath);

// 数据库表结构
const createTables = `
-- 商品分类表
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 项目表
CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 商品表
CREATE TABLE IF NOT EXISTS products (
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

-- 交易记录表
CREATE TABLE IF NOT EXISTS transactions (
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

-- 管理员设置表
CREATE TABLE IF NOT EXISTS admin_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

// 初始化示例数据
const insertSampleData = `
-- 插入示例分类 (与现有系统的9个分类保持一致)
INSERT OR IGNORE INTO categories (name, description) VALUES 
('螺丝', '螺丝类零件'),
('金属', '金属制零部件'),
('电仪', '电气仪表设备'),
('PP材质', 'PP塑料材质物品'),
('阀门', '各类阀门设备'),
('劳保', '劳保用品'),
('工具', '工具设备'),
('一次性', '一次性用品'),
('油漆', '油漆');

-- 插入示例项目 (与现有系统的8个项目保持一致)
INSERT OR IGNORE INTO projects (name, description) VALUES 
('二车间', '二车间部门'),
('三车间', '三车间部门'),
('制冷剂', '制冷剂部门'),
('公共系统', '公共系统部门'),
('分析室', '分析室部门'),
('四车间', '四车间部门'),
('研发', '研发部门'),
('机修', '机修部门');

-- 插入示例产品
INSERT OR IGNORE INTO products (name, barcode, category_id, price, current_unit_price, stock, min_stock, total_cost_value) VALUES 
('M8×25不锈钢螺丝', 'SS001', 1, 5.32, 5.32, 230, 50, 1223.60),
('M6×20螺丝', 'SS002', 1, 3.04, 3.04, 305, 50, 927.20),
('M10×30六角螺栓', 'SS003123', 1, 8.09, 8.09, 280, 50, 2265.20),
('M5×15平头螺丝', 'SS004', 1, 2.65, 2.65, 394, 100, 1044.10),
('304不锈钢管', '6008390TBE6000', 2, 10.45, 10.45, 57, 10, 595.65),
('铝合金支架', 'MJ002', 2, 120.00, 120.00, 12, 5, 1440.00),
('温度传感器PT100', 'EI001', 3, 277.90, 277.90, 31, 5, 8614.90),
('PP化工管道', 'PP001', 4, 25.00, 25.00, 122, 10, 3050.00),
('球阀DN25', 'VL001', 5, 320.00, 320.00, 6, 2, 1920.00);

-- 插入管理员设置 (与现有系统设置保持一致)
INSERT OR IGNORE INTO admin_settings (key, value) VALUES 
('admin_password', '$2a$10$42jsbjFJV.ALyDcuhVwFQugSeSfuI3F9PuwYzuvgwehErVLCvyAqm'),
('system_name', '备品备件管理系统'),
('system_version', '1.0.0'),
('low_stock_threshold', '10'),
('auto_backup_enabled', 'true'),
('backup_retention_days', '30'),
('default_currency', 'CNY'),
('company_name', '公司名称'),
('company_address', '公司地址'),
('notification_email', 'admin@company.com'),
('general.systemName', '备品备件管理系统'),
('general.timezone', 'auto'),
('general.language', 'zh-CN'),
('inventory.defaultMinStock', '10'),
('inventory.lowStockThreshold', '5'),
('inventory.updateInterval', '30'),
('security.sessionTimeout', '60'),
('backup.autoBackup', 'true'),
('backup.frequency', 'daily'),
('backup.retentionCount', '7');
`;

console.log('🚀 正在初始化数据库...');

try {
    // 创建表结构
    console.log('📋 创建数据库表结构...');
    db.exec(createTables);
    console.log('✅ 数据库表结构创建成功');

    // 插入示例数据
    console.log('📦 插入示例数据...');
    db.exec(insertSampleData);
    console.log('✅ 示例数据插入成功');

    console.log('🎉 数据库初始化完成！');
    console.log('💡 数据库文件位置:', dbPath);

} catch (err) {
    console.error('❌ 数据库初始化失败:', err.message);
    process.exit(1);
} finally {
    // 关闭数据库连接
    db.close();
}
