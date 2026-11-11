-- Relances automatiques : trace des e-mails de relance envoyés aux clients.
-- Migration additive (une valeur d'enum). Équivalent de `npm run db:push`
-- pour les bases déjà en production. À exécuter AVANT de déployer le code.

ALTER TYPE "EventType" ADD VALUE IF NOT EXISTS 'FOLLOW_UP_SENT';
