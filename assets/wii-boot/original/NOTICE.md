> Current runtime: all nine Nintendo icons/banners have been replaced with Italian
> native BRLYT/BRLAN renders. The PAL clock, health textures, pointer and UI are
> extracted from 4.3E. The font is the original Wii NTLG PGothic Opera face.
> Banner samples come from each original sound.bin, including native loop points.
> See ../NOTICE.md and manifest.json for the final file inventory. The collection
> notes below document the earlier acquisition; legacy files are retained but
> their old limitations do not describe the replacement runtime assets.

# Wii resources: provenance and limits

Nintendo owns the Wii marks, original channel artwork and system/channel recordings. Fontworks owns FOT-RodinNTLG Pro DB. This portfolio is not affiliated with either company. No free-content license is asserted for those resources. File-level source URLs, runtime transformations, hashes, dimensions and audio durations are recorded in `manifest.json`.

## Source collections

- [Ascript89 / Onliine](https://github.com/Ascript89/onliine): Wii interface sprites, channel artwork components, several banner captures and MP3 recordings. These are assets supplied by a community reconstruction; their presence here is not proof that every sprite is a byte-identical original Nintendo texture. No upstream JavaScript or CSS implementation was imported.
- [danintosh / Wii-Menu-HTML](https://github.com/danintosh/Wii-Menu-HTML): **Digiface** clock font. Its name table identifies WSI, 1993. It is a substitute, not an original Wii clock font. The original clock uses raster glyphs; this acquisition did not obtain that native glyph sheet.
- [Fraulk / Wii-Menu](https://github.com/Fraulk/Wii-Menu): SD logo image supplied with that reconstruction.
- [MarioCube: All Wii Menu Sounds](https://repo.mariocube.com/Wii/Menu%20%26%20Shop%20BGM/): preserved Nintendo system sound recordings; selected named WAV samples were encoded locally as MP3 with ffmpeg.
- [WiiBrew](https://wiibrew.org/): original-channel banner screenshots for Forecast, Internet, Everybody Votes and Nintendo Channel. They are full banner screenshots, not small menu icons or original texture dumps.
- [Super Mario Wiki Wii media](https://www.mariowiki.com/Multimedia:Wii): preserved Forecast and Check Mii Out/Mii Contest banner recordings and Message Board background music.
- [VGM Treasure Chest Wii System Soundtrack](https://downloads.khinsider.com/game-soundtracks/album/wii-system-soundtrack): preserved Internet Channel banner recording.
- [Wii Menu frame preserved by G.URL](https://gurlworld.co.uk/wp-content/uploads/2024/07/a.PNG-1.jpg): the nine `thumbnail.webp` files are exact tile interiors extracted from this real menu screen capture. They retain captured English artwork. They are genuine static menu frames, not original texture files or animated icon exports. Extraction rectangles are in the manifest.

## Runtime derivatives

`fonts/menu.woff2` is a Latin subset of the upstream font whose name metadata identifies **FOT-RodinNTLG Pro DB**. The source OTF is preserved in the QA source cache outside the published `dist` tree.

The `banner.webp` files retain the frames and durations from upstream GIF captures at a maximum width of 640 pixels. Shop has 252 frames, News 150, Disc 12. **Mii and Photo upstream GIFs have only one frame**. Any animation added by the application around static artwork is a browser reconstruction, not a recorded native sequence. `poster.webp` is a still frame for reduced-motion presentation.

The preserved artwork is largely English. Italian accessible names and browser-rendered labels do not turn those images into verified Italian PAL captures. A claim of complete pixel-for-pixel PAL 4.3 Italian equivalence is not established by this asset set.

No distinct Settings/SD background loops were located. The source-grounded Tomoeko/Wii_Menu_HTML reconstruction keeps its single `WIPL_BGM_MENU` background active for Grid, Board, Settings and SD scenes. The `sd-banner.mp3` sample is a short software-banner cue, not an SD-menu background loop.

Official Italian menu, settings, SD, HOME and health-screen references and their source notes are kept under `output/playwright/wii-reconstruction/references/` outside the published site.
