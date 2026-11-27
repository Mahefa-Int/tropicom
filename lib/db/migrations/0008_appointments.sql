CREATE TABLE `appointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`starts_at` datetime NOT NULL,
	`ends_at` datetime NOT NULL,
	`kind` varchar(80) NOT NULL,
	`name` varchar(160) NOT NULL,
	`company` varchar(160),
	`email` varchar(190) NOT NULL,
	`phone` varchar(60),
	`mode` enum('visio','tel') NOT NULL DEFAULT 'visio',
	`need` text,
	`timezone` varchar(60) NOT NULL DEFAULT 'Indian/Antananarivo',
	`status` enum('confirmed','cancelled') NOT NULL DEFAULT 'confirmed',
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `appointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `appointments_starts_idx` ON `appointments` (`starts_at`);