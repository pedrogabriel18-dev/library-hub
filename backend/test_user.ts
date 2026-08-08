import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
p.user.findUnique({where: {login: 'aluno.teste'}}).then(u => {
  console.log('User:', u);
  process.exit(0);
});
