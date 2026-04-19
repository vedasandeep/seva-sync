-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('VOLUNTEER', 'NGO_COORDINATOR', 'DISASTER_ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "DisasterType" AS ENUM ('FLOOD', 'CYCLONE', 'EARTHQUAKE', 'LANDSLIDE', 'FIRE', 'OTHER');

-- CreateEnum
CREATE TYPE "DisasterStatus" AS ENUM ('PLANNING', 'ACTIVE', 'RESOLVED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TaskUrgency" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('PENDING', 'SYNCED', 'CONFLICT');

-- CreateEnum
CREATE TYPE "CallDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "name" TEXT NOT NULL,
    "organization" TEXT,
    "region" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volunteers" (
    "id" TEXT NOT NULL,
    "phone_encrypted" TEXT NOT NULL,
    "phone_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en',
    "skills" JSONB NOT NULL DEFAULT '[]',
    "availability_radius_km" INTEGER NOT NULL DEFAULT 10,
    "current_lat" DECIMAL(10,8),
    "current_lng" DECIMAL(11,8),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "burnout_score" DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    "total_tasks_completed" INTEGER NOT NULL DEFAULT 0,
    "last_checkin" TIMESTAMP(3),
    "last_active_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "volunteers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disasters" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "DisasterType" NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "status" "DisasterStatus" NOT NULL DEFAULT 'ACTIVE',
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "disasters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL,
    "disaster_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "required_skills" JSONB NOT NULL DEFAULT '[]',
    "urgency" "TaskUrgency" NOT NULL,
    "latitude" DECIMAL(10,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "assigned_volunteer_id" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'OPEN',
    "max_volunteers" INTEGER NOT NULL DEFAULT 1,
    "current_volunteers" INTEGER NOT NULL DEFAULT 0,
    "estimated_hours" INTEGER,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigned_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_logs" (
    "id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "volunteer_id" TEXT NOT NULL,
    "action" TEXT,
    "hours_logged" DECIMAL(4,2) NOT NULL DEFAULT 0,
    "proof_media_url" TEXT,
    "gps_lat" DECIMAL(10,8),
    "gps_lng" DECIMAL(11,8),
    "notes" TEXT,
    "sync_status" "SyncStatus" NOT NULL DEFAULT 'SYNCED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "synced_at" TIMESTAMP(3),

    CONSTRAINT "task_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wellness_checkins" (
    "id" TEXT NOT NULL,
    "volunteer_id" TEXT NOT NULL,
    "checkin_date" DATE NOT NULL,
    "feeling" TEXT NOT NULL,
    "sentiment_score" DECIMAL(3,2),
    "voice_note_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wellness_checkins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ivr_logs" (
    "id" TEXT NOT NULL,
    "volunteer_id" TEXT NOT NULL,
    "call_sid" TEXT NOT NULL,
    "direction" "CallDirection" NOT NULL DEFAULT 'INBOUND',
    "action_type" TEXT NOT NULL,
    "input_value" TEXT,
    "language" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ivr_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "volunteers_phone_encrypted_key" ON "volunteers"("phone_encrypted");

-- CreateIndex
CREATE UNIQUE INDEX "volunteers_phone_hash_key" ON "volunteers"("phone_hash");

-- CreateIndex
CREATE INDEX "volunteers_phone_hash_idx" ON "volunteers"("phone_hash");

-- CreateIndex
CREATE INDEX "volunteers_is_active_idx" ON "volunteers"("is_active");

-- CreateIndex
CREATE INDEX "volunteers_is_available_idx" ON "volunteers"("is_available");

-- CreateIndex
CREATE INDEX "disasters_status_idx" ON "disasters"("status");

-- CreateIndex
CREATE INDEX "disasters_start_date_idx" ON "disasters"("start_date" DESC);

-- CreateIndex
CREATE INDEX "tasks_disaster_id_status_idx" ON "tasks"("disaster_id", "status");

-- CreateIndex
CREATE INDEX "tasks_urgency_idx" ON "tasks"("urgency");

-- CreateIndex
CREATE INDEX "tasks_assigned_volunteer_id_idx" ON "tasks"("assigned_volunteer_id");

-- CreateIndex
CREATE INDEX "task_logs_volunteer_id_created_at_idx" ON "task_logs"("volunteer_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "task_logs_task_id_idx" ON "task_logs"("task_id");

-- CreateIndex
CREATE INDEX "task_logs_sync_status_idx" ON "task_logs"("sync_status");

-- CreateIndex
CREATE INDEX "wellness_checkins_volunteer_id_checkin_date_idx" ON "wellness_checkins"("volunteer_id", "checkin_date" DESC);

-- CreateIndex
CREATE INDEX "ivr_logs_volunteer_id_created_at_idx" ON "ivr_logs"("volunteer_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "ivr_logs_call_sid_idx" ON "ivr_logs"("call_sid");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_disaster_id_fkey" FOREIGN KEY ("disaster_id") REFERENCES "disasters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigned_volunteer_id_fkey" FOREIGN KEY ("assigned_volunteer_id") REFERENCES "volunteers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_logs" ADD CONSTRAINT "task_logs_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_logs" ADD CONSTRAINT "task_logs_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "volunteers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wellness_checkins" ADD CONSTRAINT "wellness_checkins_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "volunteers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ivr_logs" ADD CONSTRAINT "ivr_logs_volunteer_id_fkey" FOREIGN KEY ("volunteer_id") REFERENCES "volunteers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
