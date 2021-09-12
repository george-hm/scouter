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
  `hasImage` TINYINT DEFAULT 0 NOT NULL,
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
  `totalSummons` int NOT NULL,
  `lastHourlyCheckIn` bigint NOT NULL,
  `hourlyStreak` int NOT NULL,
  `lastDailyCheckIn` bigint NOT NULL,
  `dailyStreak` int NOT NULL,
  `created` bigint NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE `inventory` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `playerId` varchar(18) NOT NULL,
  `characterId` bigint NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`playerId`) REFERENCES `player`(id),
  FOREIGN KEY (`characterId`) REFERENCES `character`(id)
);

CREATE TABLE `banner` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `secondname` varchar(255) NOT NULL,
  `characterId` bigint NOT NULL,
  `expires` bigint NOT NULL DEFAULT 0,
  `rarity` int NOT NULL,
  `type` tinyint NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY (`name`),
  FOREIGN KEY (`characterId`) REFERENCES `character`(id),
  KEY idxExpires(`expires`)
);
