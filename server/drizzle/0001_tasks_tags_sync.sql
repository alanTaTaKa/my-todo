CREATE TABLE "tags" (
	"id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT 'gold' NOT NULL,
	"created_at" bigint NOT NULL,
	"updated_at" bigint NOT NULL,
	"deleted_at" bigint,
	"synced_at" bigint NOT NULL,
	CONSTRAINT "tags_user_id_id_pk" PRIMARY KEY("user_id","id")
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" text NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"priority" text DEFAULT 'none' NOT NULL,
	"due_date" bigint,
	"created_at" bigint NOT NULL,
	"completed_at" bigint,
	"updated_at" bigint NOT NULL,
	"deleted_at" bigint,
	"tag_ids" text[] DEFAULT ARRAY[]::text[] NOT NULL,
	"synced_at" bigint NOT NULL,
	CONSTRAINT "tasks_user_id_id_pk" PRIMARY KEY("user_id","id")
);
--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "tags_user_synced_idx" ON "tags" USING btree ("user_id","synced_at");--> statement-breakpoint
CREATE INDEX "tasks_user_synced_idx" ON "tasks" USING btree ("user_id","synced_at");