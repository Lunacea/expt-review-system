import { fail, redirect } from '@sveltejs/kit';
import { updateUserConsent } from '$lib/server/db/users';
import { signConsentPdf } from '$lib/server/pdf';
import fs from 'fs/promises';
import path from 'path';

export const load = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/');
	}
	if (locals.user.consent?.signed) {
		throw redirect(303, '/experiments');
	}
};

export const actions = {
	submit: async ({ request, locals }) => {
		if (!locals.user) {
			throw redirect(303, '/');
		}

		const data = await request.formData();
		const name = data.get('name')?.toString();
		const agree = data.get('agree');

		if (!name || !agree) {
			return fail(400, { error: '氏名の入力と同意が必要です' });
		}

		const date = new Date();
		const dateStr = date.toLocaleDateString('ja-JP');

		// Generate Signed PDF
		const pdfBytes = await signConsentPdf(name, dateStr);

		// Save PDF
		const fileName = `${locals.user.username}_consent.pdf`;
		const savePath = path.join('static/uploads/consents', fileName);
		await fs.writeFile(savePath, pdfBytes);

		// Update DB
		await updateUserConsent(locals.user.username, {
			name,
			date,
			signed: true,
			pdfPath: `/uploads/consents/${fileName}`
		});

		throw redirect(303, '/experiments');
	}
};


