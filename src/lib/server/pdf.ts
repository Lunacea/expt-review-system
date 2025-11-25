import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs/promises';
import path from 'path';

export async function signConsentPdf(name: string, date: string): Promise<Uint8Array> {
	const pdfPath = 'static/lib/expt-inst.pdf';
	const pdfBytes = await fs.readFile(pdfPath);
	const pdfDoc = await PDFDocument.load(pdfBytes);

	// Register fontkit
	pdfDoc.registerFontkit(fontkit);

	// Load Japanese Font
    // Using NotoSansJP-Regular.ttf (downloaded as .ttf but the URL was .otf, let's check what was actually saved. 
    // The curl command saved to static/fonts/NotoSansJP-Regular.ttf.
    // If it is OTF content in a TTF file, fontkit usually handles it, but let's be careful.)
	const fontPath = 'static/fonts/NotoSansJP-Regular.ttf';
	const fontBytes = await fs.readFile(fontPath);
	const customFont = await pdfDoc.embedFont(fontBytes);

	const pages = pdfDoc.getPages();
	const lastPage = pages[pages.length - 1];
    
    // Coordinates might need adjustment based on the actual PDF layout.
    // Assuming bottom area.
	lastPage.drawText(`Signed by: ${name}`, {
		x: 50,
		y: 50,
		size: 12,
		font: customFont,
		color: rgb(0, 0, 0),
	});

    lastPage.drawText(`Date: ${date}`, {
		x: 50,
		y: 30,
		size: 12,
		font: customFont,
		color: rgb(0, 0, 0),
	});

	const pdfOut = await pdfDoc.save();
	return pdfOut;
}
