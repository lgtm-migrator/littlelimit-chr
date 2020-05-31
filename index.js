const fs = require('fs');
const sharp = require('sharp');

const filename = 'misaki_mincho';
const fontHeight = 8;
const numberOfChars = 8192;

const main = async () => {
  const image = sharp(`${filename}.png`)
  const metadata = await image.metadata();
  const buffer = await image
    .toColorspace('b-w')
    .raw()
    .toBuffer();

  const charsPerLine = metadata.width / 8;
  const charHeight = Math.ceil(fontHeight / 8) * 8;
  const chr = new Uint8Array(numberOfChars * charHeight);
  let chrIndex = 0;

  [...Array(numberOfChars).keys()].forEach((index) => {
    [...Array(fontHeight).keys()].forEach((y) => {
      const offset = (index % charsPerLine) * 8 + (Math.floor(index / charsPerLine) * fontHeight + y) * metadata.width;
      const byte = !buffer[offset + 0] << 7
        | !buffer[offset + 1] << 6
        | !buffer[offset + 2] << 5
        | !buffer[offset + 3] << 4
        | !buffer[offset + 4] << 3
        | !buffer[offset + 5] << 2
        | !buffer[offset + 6] << 1
        | !buffer[offset + 7] << 0;

      chr[chrIndex++] = byte;
    });

    [...Array(charHeight - fontHeight).keys()].forEach(() => chr[chrIndex++] = 0x00);
  });

  fs.writeFileSync(`${filename}.chr`, chr);
}

main();
