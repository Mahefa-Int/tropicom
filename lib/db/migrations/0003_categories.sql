CREATE TABLE `categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(80) NOT NULL,
	`slug` varchar(80) NOT NULL,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `categories_slug_uq` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `posts` ADD `category_id` int;--> statement-breakpoint
CREATE INDEX `posts_category_idx` ON `posts` (`category_id`);--> statement-breakpoint
INSERT IGNORE INTO `categories` (`name`, `slug`) SELECT DISTINCT `category`, LOWER(REPLACE(TRIM(`category`), ' ', '-')) FROM `posts` WHERE `category` IS NOT NULL AND TRIM(`category`) <> '';--> statement-breakpoint
UPDATE `posts` p JOIN `categories` c ON c.`name` = p.`category` SET p.`category_id` = c.`id`;
