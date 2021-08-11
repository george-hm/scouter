CREATE TABLE `character` (
  `id` bigint NOT NULL,
  `resource_id` bigint NOT NULL,
  `cost` bigint NOT NULL,
  `name` varchar(256) NOT NULL,
  `secondname` varchar(512) NOT NULL,
  `avg_stats` bigint NOT NULL,
  `v_rarity` tinyint NOT NULL,
  `rarity` varchar(20) NOT NULL,
  `class` varchar(20) NOT NULL,
  `type` varchar(20) NOT NULL,
  `leader` TEXT NOT NULL,
  `super` JSON NOT NULL,
  `passive` JSON NOT NULL,
  `links` JSON NOT NULL,
  PRIMARY KEY (`id`),
  KEY `v_rarity` (`v_rarity`)
);

CREATE TABLE `category` (
  `category` varchar(128) NOT NULL,
  `id` bigint NOT NULL,
  PRIMARY KEY (`category`, `id`),
  KEY `category` (`category`)
);

CREATE TABLE `player` (
  `id` varchar(18) NOT NULL,
  `currency` int NOT NULL,
  `inventory` json NOT NULL,
  `lastHourlyCheckIn` bigint NOT NULL,
  `hourlyStreak` int NOT NULL,
  `lastDailyCheckin` bigint NOT NULL,
  `dailyStreak` int NOT NULL,
  `created` bigint NOT NULL,
  PRIMARY KEY (`id`)
);
