import 'dotenv/config'; // <--- Add this at the very top
import { PrismaClient, Role } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcrypt';

// 1. Get the connection string from your environment
const connectionString = process.env.DATABASE_URL;

// 2. Setup standard standard Postgres connection pool
const pool = new Pool({ connectionString });

// 3. Wrap it with the Prisma Adapter
const adapter = new PrismaPg(pool);

// 4. Pass the adapter to the Prisma Client
const prisma = new PrismaClient({ adapter });

async function main() {  
  console.log('Starting database seeding...');

  // 1. Seed System Configs
  const configs = [
    { key: 'max_upload_size_mb', value: '200' },
    { key: 'session_timeout_minutes', value: '30' },
  ];

  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {},
      create: {
        key: config.key,
        value: config.value,
      },
    });
  }
  console.log('✅ System Configs seeded.');

  // 2. Seed Departments
  const departmentsData = [
    { code: 'IRR', nameAr: 'الري', nameEn: 'Irrigation' },
    { code: 'MNT', nameAr: 'الصيانة', nameEn: 'Maintenance' },
    { code: 'DEL', nameAr: 'التسليم', nameEn: 'Delivery' },
    { code: 'TECH', nameAr: 'المكتب الفني', nameEn: 'Technical Office' },
    { code: 'CON', nameAr: 'الإنشاءات', nameEn: 'Construction' },
  ];

  const createdDepartments = [];
  for (const dept of departmentsData) {
    const department = await prisma.department.upsert({
      where: { code: dept.code },
      update: {},
      create: dept,
    });
    createdDepartments.push(department);
  }
  console.log('✅ Departments seeded.');

  // 3. Hash default password
  const defaultPasswordHash = await bcrypt.hash('Admin@123', 10);

  // 4. Seed Admin User
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      fullName: 'System Administrator',
      email: 'admin@system.local',
      passwordHash: defaultPasswordHash,
      role: Role.ADMIN,
    },
  });
  console.log('✅ Admin user seeded.');

  // 5. Seed Users (DC, Manager, Engineer) per department
  for (const dept of createdDepartments) {
    const deptPrefix = dept.code.toLowerCase();
    
    const usersToCreate = [
      {
        username: `dc_${deptPrefix}`,
        fullName: `${dept.nameEn} Document Controller`,
        role: Role.DC,
      },
      {
        username: `mgr_${deptPrefix}`,
        fullName: `${dept.nameEn} Manager`,
        role: Role.MANAGER,
      },
      {
        username: `eng_${deptPrefix}`,
        fullName: `${dept.nameEn} Engineer`,
        role: Role.ENGINEER,
      },
    ];

    for (const u of usersToCreate) {
      await prisma.user.upsert({
        where: { username: u.username },
        update: {},
        create: {
          username: u.username,
          fullName: u.fullName,
          passwordHash: defaultPasswordHash,
          role: u.role,
          departmentId: dept.id,
        },
      });
    }
  }
  console.log('✅ Department specific users (DC, Manager, Engineer) seeded.');
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });