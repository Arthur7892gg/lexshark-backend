import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Camada genérica de sincronização: recebe o payload "data" tal como o
// frontend já guarda no IndexedDB (sem exigir remodelagem das telas).
// Cada entidade sincronizável (clients, cases, agenda) é armazenada com
// office_id e um campo "data" JSON livre, preservando 100% a estrutura atual.
@Injectable()
export class SyncService {
  constructor(private prisma: PrismaService) {}

  async pullAll(officeId: string) {
    const [clients, cases, agenda] = await Promise.all([
      this.prisma.client.findMany({ where: { officeId } }),
      this.prisma.caseFile.findMany({ where: { officeId } }),
      this.prisma.agendaItem.findMany({ where: { officeId } }),
    ]);
    return { clients, cases, agenda };
  }

  async pushClients(officeId: string, items: any[]) {
    return this.upsertMany('client', officeId, items);
  }

  async pushCases(officeId: string, items: any[]) {
    return this.upsertMany('caseFile', officeId, items);
  }

  async pushAgenda(officeId: string, items: any[]) {
    return this.upsertMany('agendaItem', officeId, items);
  }

  // Upsert genérico: se o item já tem id local, atualiza; senão, cria.
  private async upsertMany(model: 'client' | 'caseFile' | 'agendaItem', officeId: string, items: any[]) {
    const results = [];
    for (const item of items ?? []) {
      const { id, ...rest } = item;
      const baseData: any = { officeId, data: item };
      if (model === 'agendaItem') {
        baseData.title = item.title ?? 'Sem título';
        baseData.startsAt = item.startsAt ? new Date(item.startsAt) : new Date();
        baseData.endsAt = item.endsAt ? new Date(item.endsAt) : null;
      }
      if (model === 'client') baseData.name = item.name ?? 'Sem nome';
      if (model === 'caseFile') {
        baseData.number = item.number;
        baseData.status = item.status;
        baseData.value = item.value ?? null;
      }

      const record = id
        ? await (this.prisma[model] as any).upsert({
            where: { id },
            update: baseData,
            create: { id, ...baseData },
          })
        : await (this.prisma[model] as any).create({ data: baseData });
      results.push(record);
    }
    return results;
  }

  async logBackup(officeId: string, type: 'export' | 'import', fileName?: string) {
    return this.prisma.backupLog.create({ data: { officeId, type, fileName } });
  }
}
