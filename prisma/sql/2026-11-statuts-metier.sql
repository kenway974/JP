-- Statuts métier CVC pour le suivi des leads (back-office).
-- Migration additive : n'ajoute que des valeurs d'enum, ne modifie aucune ligne existante.
-- Équivalent de `npm run db:push` pour les bases déjà en production.
-- À exécuter AVANT de déployer le code qui utilise ces statuts.

ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'INFO_INCOMPLETE';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'AWAITING_CLIENT';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'VISIT_TO_PLAN';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'VISIT_DONE';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'QUOTE_FOLLOW_UP';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'OUT_OF_ZONE';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'OUT_OF_SCOPE';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'BUDGET_MISMATCH';
ALTER TYPE "LeadStatus" ADD VALUE IF NOT EXISTS 'UNREACHABLE';

ALTER TYPE "EventType" ADD VALUE IF NOT EXISTS 'STATUS_CHANGED';
ALTER TYPE "EventType" ADD VALUE IF NOT EXISTS 'NOTE';
