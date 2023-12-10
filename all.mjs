import googlePlay from 'google-play-scraper';
import ExcelJS from 'exceljs';

async function getAppInfo(appId) {
    try {
        const appInfo = await googlePlay.app({ appId });
        return appInfo;
    } catch (error) {
        console.error(`Error: ${error}`);
        return null;
    }
}

async function getAllAppReviews(appId) {
    try {
        const allReviews = await googlePlay.reviews({ appId });
        return allReviews;
    } catch (error) {
        console.error(`Error: ${error}`);
        return null;
    }
}

const app_id = 'com.ticktick.task'; // Replace with your app ID

(async () => {
    const appInfo = await getAppInfo(app_id);
    const allAppReviews = await getAllAppReviews(app_id);

    if (appInfo && Array.isArray(allAppReviews)) {
        const appRating = appInfo.score;

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('All_Reviews');

        worksheet.columns = [
            { header: 'App ID', key: 'appId', width: 15 },
            { header: 'Rating', key: 'rating', width: 10 },
            { header: 'Username', key: 'username', width: 20 },
            { header: 'Review', key: 'review', width: 50 },
        ];

        allAppReviews.forEach((review) => {
            const username = review.userName;
            const comment = review.text;
            worksheet.addRow({ appId: app_id, rating: appRating, username, review: comment });
            console.log(`Username: ${username}, Review: ${comment}`);
        });

        const filename = `${app_id}_all_reviews.xlsx`;
        await workbook.xlsx.writeFile(filename);
        console.log(`All reviews along with app rating saved to ${filename}.`);
    } else {
        console.log('Failed to retrieve app information or reviews.');
    }
})();
