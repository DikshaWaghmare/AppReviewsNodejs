// // store count data

// import gplay from 'google-play-scraper';
// import ExcelJS from 'exceljs';

// const appId = 'free.programming.programming';
// const reviewsCount = 20; // Number of reviews to fetch

// async function fetchAppInfoAndReviews() {
//     try {
//         const appInfo = await gplay.app({ appId });
//         let appReviews = await gplay.reviews({
//             appId,
//             sort: gplay.sort.NEWEST,
//             num: reviewsCount,
//         });

//         if (!Array.isArray(appReviews) && appReviews.data) {
//             // If the response is in a different format, extract reviews
//             appReviews = appReviews.data;
//         }

//         if (appInfo && Array.isArray(appReviews)) {
//             const appRating = appInfo.score;

//             // Create a new workbook
//             const workbook = new ExcelJS.Workbook();
//             const worksheet = workbook.addWorksheet('App Reviews');

//             // Add headers to the worksheet
//             worksheet.columns = [
//                 { header: 'App ID', key: 'appId', width: 15 },
//                 { header: 'Rating', key: 'rating', width: 10 },
//                 { header: 'Username', key: 'username', width: 20 },
//                 { header: 'Review', key: 'review', width: 50 },
//             ];

//             // Add app information and reviews to the worksheet
//             appReviews.forEach((review) => {
//                 const username = review.userName;
//                 const comment = review.text;
//                 worksheet.addRow({ appId, rating: appRating, username, review: comment });
//             });

//             // Save the workbook to a file
//             const filename = `${appId}_reviews.xlsx`;
//             await workbook.xlsx.writeFile(filename);
//             console.log(`Reviews along with app rating saved to ${filename}.`);
//         } else {
//             console.log('Failed to retrieve app information or reviews.');
//         }
//     } catch (error) {
//         console.error('Error:', error);
//     }
// }

// fetchAppInfoAndReviews();


// // node --experimental-modules app.mjs
// =========================================================================================
// app.mjs
import express from 'express';
import gplay from 'google-play-scraper';
// import ExcelJS from 'exceljs';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static('public')); // Serve static files from the 'public' folder

app.get('/appReviews', async (req, res) => {
    const { appId } = req.query; // Get the 'appId' from the query parameter

    try {
        const appInfo = await gplay.app({ appId });
        let appReviews = await gplay.reviews({
            appId,
            sort: gplay.sort.NEWEST,
            num: 20, // You can set the number of reviews to fetch here
        });

        if (!Array.isArray(appReviews) && appReviews.data) {
            // If the response is in a different format, extract reviews
            appReviews = appReviews.data;
        }

        if (appInfo && Array.isArray(appReviews)) {
            const appRating = appInfo.score;

            const reviewsData = appReviews.map((review) => ({
                appId,
                rating: appRating,
                username: review.userName,
                review: review.text,
            }));

            res.json({ appInfo, reviews: reviewsData });
        } else {
            res.status(404).json({ message: 'Failed to retrieve app information or reviews.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching data.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
