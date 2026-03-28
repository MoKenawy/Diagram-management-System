import 'dotenv/config';
import { Role } from '@prisma/client';
import { prisma } from '../src/lib/prisma'; // Use shared client
import { hashPassword } from '../src/utils/auth';

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
      create: config,
    });
  }

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
    const d = await prisma.department.upsert({
      where: { code: dept.code },
      update: {},
      create: dept,
    });
    createdDepartments.push(d);
  }

  // 3. Hash default password using util (Cost factor 12)
  const defaultPasswordHash = await hashPassword('Admin@123');

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

  // 5. Seed Department Users
  for (const dept of createdDepartments) {
    const deptPrefix = dept.code.toLowerCase();
    const usersToCreate = [
      { username: `dc_${deptPrefix}`, fullName: `${dept.nameEn} DC`, role: Role.DC },
      { username: `mgr_${deptPrefix}`, fullName: `${dept.nameEn} Mgr`, role: Role.MANAGER },
      { username: `eng_${deptPrefix}`, fullName: `${dept.nameEn} Eng`, role: Role.ENGINEER },
    ];

    for (const u of usersToCreate) {
      await prisma.user.upsert({
        where: { username: u.username },
        update: {},
        create: {
          ...u,
          passwordHash: defaultPasswordHash,
          departmentId: dept.id,
        },
      });
    }
  }

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