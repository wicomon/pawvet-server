import 'dotenv/config';
import * as encrypter from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

async function main() {

  const company = await prisma.company.upsert({
    where: { slug: 'pawnvet-demo' },
    update: {},
    create: {
      name: 'PawnVet Clínica Demo',
      slug: 'pawnvet-demo',
    },
  });

  // Roles del negocio: ROOT (dueño de la plataforma), ADMIN (dueño de la
  // veterinaria/petshop), DOCTOR (veterinario, registra pacientes/consultas),
  // RECEPTIONIST (recepción/caja).
  const profiles = await Promise.all([
    prisma.role.upsert({
      where: { slug: 'root' },
      update: {},
      create: {
        name: 'ROOT',
        description: 'Root profile with all permissions',
        slug: 'root',
      },
    }),
    prisma.role.upsert({
      where: { slug: 'admin' },
      update: {},
      create: {
        name: 'ADMIN',
        description: 'Administrator profile with full access',
        slug: 'admin',
      },
    }),
    prisma.role.upsert({
      where: { slug: 'doctor' },
      update: {},
      create: {
        name: 'DOCTOR',
        description: 'Veterinario: registra pacientes, citas e historias clínicas',
        slug: 'doctor',
        canDelete: false,
      },
    }),
    prisma.role.upsert({
      where: { slug: 'receptionist' },
      update: {},
      create: {
        name: 'RECEPTIONIST',
        description: 'Recepción/caja: agenda citas, clientes y facturación',
        slug: 'receptionist',
        canDelete: false,
      },
    }),
  ]);

  // Create default admin user
  const salt = encrypter.genSaltSync();
  const encryptedPassword = encrypter.hashSync('123456', salt);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@pawcontrol.com' },
    update: {},
    create: {
      firstName: 'root',
      lastName: 'admin',
      email: 'admin@pawcontrol.com',
      company: {
        connect: {
          slug: 'pawnvet-demo'
        }
      },
      password: encryptedPassword,
      role: {
        connect: {
          slug: 'root'
        }
      }
    },
  })

  // Catálogo de menús de nivel superior. El gating por rol ocurre a este
  // nivel (RoleMenu solo admite parentId: null); los hijos heredarían la
  // visibilidad del padre en una futura iteración con subMenu.
  const menuDefs = [
    { code: 'dashboard', name: 'Dashboard', path: '/dashboard', icon: 'layout-dashboard', order: 0 },
    { code: 'clientes', name: 'Clientes', path: '/clientes', icon: 'users', order: 1 },
    { code: 'pacientes', name: 'Pacientes', path: '/pacientes', icon: 'paw-print', order: 2 },
    { code: 'citas', name: 'Citas', path: '/citas', icon: 'calendar', order: 3 },
    { code: 'productos', name: 'Productos', path: '/productos', icon: 'package', order: 4 },
    { code: 'facturacion', name: 'Facturación', path: '/facturacion', icon: 'receipt', order: 5 },
    { code: 'reportes', name: 'Reportes', path: '/reportes', icon: 'bar-chart', order: 6 },
    { code: 'usuarios', name: 'Usuarios', path: '/usuarios', icon: 'user-cog', order: 7 },
    { code: 'roles', name: 'Roles', path: '/roles', icon: 'shield', order: 8 },
    { code: 'menus', name: 'Menús', path: '/menus', icon: 'menu', order: 9 },
    { code: 'organizaciones', name: 'Organizaciones', path: '/organizaciones', icon: 'building', order: 10 },
  ];

  const menus = await Promise.all(
    menuDefs.map((menu) =>
      prisma.menu.upsert({
        where: { code: menu.code },
        update: {},
        create: menu,
      }),
    ),
  );

  const menuIdByCode = new Map(menus.map((m) => [m.code, m.id]));
  const roleBySlug = new Map(profiles.map((r) => [r.slug, r]));

  // Asignación rol -> menús de nivel superior visibles.
  const roleMenuMap: Record<string, string[]> = {
    root: menuDefs.map((m) => m.code),
    admin: ['dashboard', 'clientes', 'pacientes', 'citas', 'productos', 'facturacion', 'reportes', 'usuarios'],
    doctor: ['dashboard', 'pacientes', 'citas'],
    receptionist: ['dashboard', 'clientes', 'pacientes', 'citas', 'productos', 'facturacion'],
  };

  for (const [roleSlug, menuCodes] of Object.entries(roleMenuMap)) {
    const role = roleBySlug.get(roleSlug);
    if (!role) continue;

    for (const menuCode of menuCodes) {
      const menuId = menuIdByCode.get(menuCode);
      if (!menuId) continue;

      await prisma.roleMenu.upsert({
        where: { roleId_menuId: { roleId: role.id, menuId } },
        update: {},
        create: { roleId: role.id, menuId },
      });
    }
  }

  // Catálogo de planes de la plataforma. "pro" arranca desactivado: aún no
  // hay notificaciones WhatsApp ni facturación electrónica que ofrecer.
  const plans = await Promise.all([
    prisma.plan.upsert({
      where: { code: 'emprendedor' },
      update: {},
      create: {
        code: 'emprendedor',
        name: 'Emprendedor',
        description: 'Plan base para clínicas y petshops empezando con pawnvet.',
        price: 49.9,
        currency: 'PEN',
        interval: 'MONTH',
        isActive: true,
      },
    }),
    prisma.plan.upsert({
      where: { code: 'pro' },
      update: {},
      create: {
        code: 'pro',
        name: 'Pro',
        description: 'Incluye notificaciones por WhatsApp y facturación electrónica SUNAT.',
        price: 99.9,
        currency: 'PEN',
        interval: 'MONTH',
        whatsappNotifications: true,
        electronicInvoicing: true,
        isActive: false,
      },
    }),
  ]);

  const emprendedorPlan = plans.find((p) => p.code === 'emprendedor')!;

  // Suscripción demo en periodo de prueba (14 días) para la company demo.
  const trialDays = 14;
  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);

  const subscription = await prisma.subscription.upsert({
    where: { companyId: company.id },
    update: {},
    create: {
      companyId: company.id,
      planId: emprendedorPlan.id,
      status: 'TRIAL',
      trialEndsAt,
      currentPeriodEnd: trialEndsAt,
    },
  });

  console.log({ profiles, adminUser, menus: menus.length, plans: plans.length, subscription: subscription.id })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
