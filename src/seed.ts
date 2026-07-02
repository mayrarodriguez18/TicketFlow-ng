import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as path from 'path';
import { User } from './users/entities/user.entity';
import { Category } from './categories/entities/category.entity';
import { Ticket } from './tickets/entities/ticket.entity';
import { Comment } from './comments/entities/comment.entity';
import { Role } from './common/enums/role.enum';

function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIndex = trimmed.indexOf('=');
        if (eqIndex > 0) {
          const key = trimmed.slice(0, eqIndex).trim();
          const value = trimmed.slice(eqIndex + 1).trim();
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    }
  }
}

loadEnv();

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'root',
    database: process.env.DATABASE_NAME || 'ticketflow_ng',
    entities: [User, Category, Ticket, Comment],
    synchronize: true,
  });

  await dataSource.initialize();
  console.log('Conectado a la base de datos');

  const userRepo = dataSource.getRepository(User);
  const categoryRepo = dataSource.getRepository(Category);

  const existingAdmin = await userRepo.findOne({ where: { email: 'admin@test.com' } });
  if (existingAdmin) {
    console.log('La base de datos ya tiene datos. Seed omitido.');
    await dataSource.destroy();
    return;
  }

  const hashedPassword = await bcrypt.hash('123456', 10);

  await userRepo.save([
    { email: 'admin@test.com', password: hashedPassword, fullName: 'Admin Principal', role: Role.ADMIN },
    { email: 'agent@test.com', password: hashedPassword, fullName: 'Agente Soporte', role: Role.AGENT },
    { email: 'user@test.com', password: hashedPassword, fullName: 'Usuario Final', role: Role.USER },
  ]);
  console.log('Usuarios creados: admin@test.com, agent@test.com, user@test.com (password: 123456)');

  await categoryRepo.save([
    { name: 'Falla de Hardware', description: 'Problemas con equipos físicos (PC, impresora, monitor)' },
    { name: 'Problema de Red', description: 'Incidencia con conectividad, WiFi o cableado' },
    { name: 'Reinicio de Contraseña', description: 'Solicitud de restablecimiento de credenciales' },
    { name: 'Software', description: 'Errores en aplicaciones o sistemas operativos' },
    { name: 'Correo Electrónico', description: 'Problemas con el cliente de correo o buzón' },
  ]);
  console.log('Categorías creadas: Falla de Hardware, Problema de Red, Reinicio de Contraseña, Software, Correo Electrónico');

  await dataSource.destroy();
  console.log('Seed completado exitosamente');
}

seed().catch((err) => {
  console.error('Error en seed:', err);
  process.exit(1);
});
