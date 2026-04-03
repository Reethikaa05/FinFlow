const { initDb } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const seed = async () => {
  const db = await initDb();
  console.log('🌱 Seeding database...');

  db._db.run(`DELETE FROM audit_logs`);
  db._db.run(`DELETE FROM notifications`);
  db._db.run(`DELETE FROM transactions`);
  db._db.run(`DELETE FROM users`);
  db._db.run(`DELETE FROM categories`);
  db._save();

  const categories = [
    { id: uuidv4(), name: 'Salary', type: 'income', color: '#10b981', icon: 'briefcase' },
    { id: uuidv4(), name: 'Freelance', type: 'income', color: '#06b6d4', icon: 'laptop' },
    { id: uuidv4(), name: 'Investments', type: 'income', color: '#8b5cf6', icon: 'trending-up' },
    { id: uuidv4(), name: 'Bonus', type: 'income', color: '#f59e0b', icon: 'gift' },
    { id: uuidv4(), name: 'Rent', type: 'expense', color: '#ef4444', icon: 'home' },
    { id: uuidv4(), name: 'Food & Dining', type: 'expense', color: '#f97316', icon: 'utensils' },
    { id: uuidv4(), name: 'Transport', type: 'expense', color: '#3b82f6', icon: 'car' },
    { id: uuidv4(), name: 'Healthcare', type: 'expense', color: '#ec4899', icon: 'heart' },
    { id: uuidv4(), name: 'Entertainment', type: 'expense', color: '#a855f7', icon: 'film' },
    { id: uuidv4(), name: 'Utilities', type: 'expense', color: '#64748b', icon: 'zap' },
    { id: uuidv4(), name: 'Shopping', type: 'expense', color: '#e11d48', icon: 'shopping-bag' },
    { id: uuidv4(), name: 'Education', type: 'expense', color: '#0891b2', icon: 'book' },
  ];
  categories.forEach(c => db.prepare('INSERT INTO categories (id,name,type,color,icon) VALUES (?,?,?,?,?)').run(c.id,c.name,c.type,c.color,c.icon));

  const password = await bcrypt.hash('password123', 10);
  const adminPass = await bcrypt.hash('admin123', 10);
  const users = [
    { id: uuidv4(), name: 'Admin User', email: 'admin@finflow.com', password: adminPass, role: 'admin', status: 'active', avatar: 'AU' },
    { id: uuidv4(), name: 'Sarah Analyst', email: 'sarah@finflow.com', password, role: 'analyst', status: 'active', avatar: 'SA' },
    { id: uuidv4(), name: 'John Viewer', email: 'john@finflow.com', password, role: 'viewer', status: 'active', avatar: 'JV' },
    { id: uuidv4(), name: 'Emma Finance', email: 'emma@finflow.com', password, role: 'analyst', status: 'active', avatar: 'EF' },
    { id: uuidv4(), name: 'Mike Manager', email: 'mike@finflow.com', password, role: 'admin', status: 'inactive', avatar: 'MM' },
  ];
  users.forEach(u => db.prepare('INSERT INTO users (id,name,email,password,role,status,avatar) VALUES (?,?,?,?,?,?,?)').run(u.id,u.name,u.email,u.password,u.role,u.status,u.avatar));

  const incCats = ['Salary','Freelance','Investments','Bonus'];
  const expCats = ['Rent','Food & Dining','Transport','Healthcare','Entertainment','Utilities','Shopping','Education'];
  const descriptions = {
    'Salary':['Monthly Salary','Base Pay','Paycheck'],
    'Freelance':['Web Design Project','Consulting Fee','Dev Contract'],
    'Investments':['Dividend Payment','Stock Returns','ETF Returns'],
    'Bonus':['Performance Bonus','Year-end Bonus'],
    'Rent':['Monthly Rent','Apartment Rent'],
    'Food & Dining':['Grocery Shopping','Restaurant Dinner','Food Delivery','Coffee Shop'],
    'Transport':['Fuel','Uber Ride','Metro Pass','Parking Fee'],
    'Healthcare':['Doctor Visit','Pharmacy','Health Insurance'],
    'Entertainment':['Netflix','Movie Tickets','Spotify','Gaming'],
    'Utilities':['Electricity Bill','Internet Bill','Water Bill'],
    'Shopping':['Clothes','Electronics','Home Decor'],
    'Education':['Online Course','Textbooks','Workshop Fee'],
  };

  const now = new Date();
  users.slice(0,4).forEach(user => {
    for (let m = 5; m >= 0; m--) {
      const mDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const yr = mDate.getFullYear(); const mo = mDate.getMonth();

      // Salary
      const salAmt = Math.round(45000 + Math.random() * 20000);
      db.prepare('INSERT INTO transactions (id,user_id,amount,type,category,description,date,tags) VALUES (?,?,?,?,?,?,?,?)').run(uuidv4(),user.id,salAmt,'income','Salary','Monthly Salary',`${yr}-${String(mo+1).padStart(2,'0')}-01`,'[]');

      // Extra income
      for (let i = 0; i < 2; i++) {
        const cat = incCats[Math.floor(Math.random()*incCats.length)];
        if (cat === 'Salary') continue;
        const amt = Math.round(2000 + Math.random()*15000);
        const day = String(Math.floor(Math.random()*28)+1).padStart(2,'0');
        const descs = descriptions[cat];
        db.prepare('INSERT INTO transactions (id,user_id,amount,type,category,description,date,tags) VALUES (?,?,?,?,?,?,?,?)').run(uuidv4(),user.id,amt,'income',cat,descs[Math.floor(Math.random()*descs.length)],`${yr}-${String(mo+1).padStart(2,'0')}-${day}`,'[]');
      }

      // Expenses
      for (let i = 0; i < 10; i++) {
        const cat = expCats[Math.floor(Math.random()*expCats.length)];
        const maxAmt = cat === 'Rent' ? 25000 : 3000;
        const amt = Math.round(200 + Math.random()*maxAmt);
        const day = String(Math.floor(Math.random()*28)+1).padStart(2,'0');
        const descs = descriptions[cat];
        db.prepare('INSERT INTO transactions (id,user_id,amount,type,category,description,date,tags) VALUES (?,?,?,?,?,?,?,?)').run(uuidv4(),user.id,-amt,'expense',cat,descs[Math.floor(Math.random()*descs.length)],`${yr}-${String(mo+1).padStart(2,'0')}-${day}`,'[]');
      }
    }
  });

  const notifs = [
    [uuidv4(),users[0].id,'Welcome to FinFlow!','Your admin account is ready. Start managing finances.','success'],
    [uuidv4(),users[0].id,'New User Registered','Sarah Analyst has joined the platform.','info'],
    [uuidv4(),users[0].id,'Monthly Report Ready','Your financial summary for this month is ready.','info'],
    [uuidv4(),users[1].id,'Budget Alert','Entertainment spending exceeds 80% of monthly budget.','warning'],
    [uuidv4(),users[1].id,'Income Received','Salary credited successfully.','success'],
    [uuidv4(),users[2].id,'Welcome!','You can now view the finance dashboard.','success'],
  ];
  notifs.forEach(n => db.prepare('INSERT INTO notifications (id,user_id,title,message,type) VALUES (?,?,?,?,?)').run(...n));

  const txCount = db.prepare('SELECT COUNT(*) as count FROM transactions').get().count;
  console.log(`✅ Seeded: ${users.length} users, ${txCount} transactions, ${categories.length} categories`);
  console.log('\n📋 Test Accounts:');
  console.log('  Admin:    admin@finflow.com  / admin123');
  console.log('  Analyst:  sarah@finflow.com  / password123');
  console.log('  Viewer:   john@finflow.com   / password123\n');
};

seed().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
