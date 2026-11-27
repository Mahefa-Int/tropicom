CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`author` varchar(160) NOT NULL,
	`avatar_url` varchar(255),
	`rating` int NOT NULL DEFAULT 5,
	`text` text NOT NULL,
	`review_date` date,
	`status` enum('published','draft') NOT NULL DEFAULT 'published',
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` varchar(64) NOT NULL,
	`value` text NOT NULL,
	CONSTRAINT `settings_key` PRIMARY KEY(`key`)
);
