CREATE TABLE `theme_tokens` (
	`id` integer PRIMARY KEY NOT NULL,
	`light` text NOT NULL,
	`dark` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `theme_tokens` (`id`, `light`, `dark`) VALUES (
	1,
	'{"paper":"#ffffff","surface":"#faf8f6","surface2":"#f3f0eb","ink":"#14110f","inkMuted":"#5c5752","inkFaint":"#8a847d","accent":"#8b0016","accentHover":"#6e0011","accentSoft":"#f4e8ea","rule":"#e6e2dd","ruleStrong":"#d4cec6","contentMax":"42rem","wideMax":"76rem","radius":"6px"}',
	'{"paper":"#0e0d0c","surface":"#161412","surface2":"#1f1c19","ink":"#f4f1ec","inkMuted":"#a39d94","inkFaint":"#6f6a63","accent":"#e0455d","accentHover":"#f0566e","accentSoft":"#2a1518","rule":"#2a2723","ruleStrong":"#3a362f","contentMax":"42rem","wideMax":"76rem","radius":"6px"}'
);
--> statement-breakpoint
ALTER TABLE `site_settings` ADD `feature_modules` text DEFAULT '{"issues":true,"video":true,"newsletter":false}' NOT NULL;
