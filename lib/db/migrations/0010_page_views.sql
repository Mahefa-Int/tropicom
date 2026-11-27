CREATE TABLE `page_views` (
	`day` date NOT NULL,
	`path` varchar(190) NOT NULL,
	`views` int NOT NULL DEFAULT 0,
	CONSTRAINT `page_views_day_path_pk` PRIMARY KEY(`day`,`path`)
);
