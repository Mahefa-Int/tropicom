ALTER TABLE `media` ADD `original_size` int;--> statement-breakpoint
ALTER TABLE `media` ADD `optimized_at` datetime;--> statement-breakpoint
UPDATE `media` SET `optimized_at` = `created_at` WHERE `mime` = 'image/webp';
