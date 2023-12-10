// store all data
import gplay from 'google-play-scraper';
import ExcelJS from 'exceljs';

const appId = 'com.ticktick.task';

async function getAllReviews() {
    try {
        const appInfo = await gplay.app({ appId });
        if (!appInfo) {
            console.log('Failed to retrieve app information.');
            return;
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Reviews');
        worksheet.columns = [
            { header: 'App ID', key: 'appId', width: 15 },
            { header: 'Rating', key: 'rating', width: 10 },
            { header: 'Username', key: 'username', width: 20 },
            { header: 'Review', key: 'review', width: 50 },
        ];

        let page = 0;
        let reviews = [];
        let allReviews = [];

        do {
            reviews = await gplay.reviews({
                appId,
                sort: gplay.sort.NEWEST,
                num: 100, // Number of reviews per page (adjust as needed)
                page: page++,
            });

            if (!Array.isArray(reviews) && reviews.data) {
                reviews = reviews.data;
            }

            allReviews = [...allReviews, ...reviews];
        } while (reviews.length > 0);

        const appRating = appInfo.score;

        allReviews.forEach((review) => {
            const username = review.userName;
            const comment = review.text;
            worksheet.addRow({ appId, rating: appRating, username, review: comment });
        });

        const filename = `${appId}_reviews.xlsx`;
        await workbook.xlsx.writeFile(filename);
        console.log(`All reviews saved to ${filename}.`);
    } catch (error) {
        console.error('Error:', error);
    }
}

getAllReviews();
