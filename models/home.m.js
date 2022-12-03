const { errors } = require('pg-promise');
const pgp = require('pg-promise')();
const cn = 'postgres://postgres:quangphat@localhost:5432/BTCN03';
const db = pgp(cn);
const Column = pgp.helpers.Column;
var CryptoJS = require("crypto-js");
var secretKey = 'the best secret key'

var fs = require('fs')
const { resolve } = require('path');
const { error } = require('console');
const pathDbCast = './db/casts.json'
const pathDbMovies = './db/movies.json'

function readDataFromJson(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
            if (err) {
                reject(err)
            }
            else {
                resolve(JSON.parse(data));
            }
        })
    })
}

module.exports = {
    insertDataFromJson: async () => {
        const casts = await readDataFromJson(pathDbCast)
        const movies = await readDataFromJson(pathDbMovies)
        for (var i=0;i<casts.length;i++){
        db.one('INSERT INTO "CASTS"("Id","Image","LegacyNameText","Name","BirthDate","BirthPlace","Gender","HeightCentimeters","Nicknames","RealName") VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT DO NOTHING RETURNING $1', [casts[i].id,casts[i].image,casts[i].legacyNameText,casts[i].name,casts[i].birthDate,casts[i].birthPlace,(casts[i].gender=='male') ? true:false,casts[i].heightCentimeters,(casts[i].nicknames) ? casts[i].nicknames.join(", "):null,casts[i].realName])
            .then(data => {
                // return data
            })
            .catch(error => {
                // console.log('ERROR:', error); // print error;
            });
        }
        // console.log(casts[i])
        for (var i = 0; i < movies.length; i++) {
            db.one('INSERT INTO "MOVIES"("Id","Img","Title","Year","TopRank","Rating","RatingCount","Genres","Synopses") VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT DO NOTHING RETURNING $1', [movies[i].id, movies[i].img, movies[i].title, movies[i].year, movies[i].topRank, movies[i].rating, movies[i].ratingCount, (movies[i].genres) ? movies[i].genres.join(", ") : null, movies[i].synopses])
                .then(data => {
                    // return data
                })
                .catch(error => {
                    // console.log('ERROR:', error); // print error;
                });
            const castInMovie=movies[i].casts
            // console.log(castInMovie)
            for (var j=0;j<castInMovie.length;j++){
                // console.log(movies[i].id,castInMovie[j].id)
                db.one('INSERT INTO "CASTSINMOVIE"("MovieID","CastID","Characters","CastName") VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING RETURNING ($1,$2)',[movies[i].id,castInMovie[j].id,(castInMovie[j].characters) ? castInMovie[j].characters.join(", "):null,castInMovie[j].name])
                .then(data=>{
                    // console.log(data)
                })
                .catch(error=>{
                    // console.log(error)
                })
            }
            const reviews=movies[i].reviews
            for (var j=0;j<reviews.length;j++){
                db.one('INSERT INTO "REVIEWS"("Id","Author","AuthorRating","HelpfulnessScore","InterestingVotes","LanguageCode","ReviewText","ReviewTitle","SubmissionDate","Movie") VALUES(DEFAULT,$1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT DO NOTHING RETURNING ($9)',[reviews[j].author,reviews[j].authorRating,reviews[j].helpfulnessScore,reviews[j].interestingVotes,reviews[j].languageCode,reviews[j].reviewText,reviews[j].reviewTitle,reviews[j].submissionDate,movies[i].id])
                .then(data=>{
                    // console.log(data)
                })
                .catch(error=>{
                    // console.log(error)
                })
            }
        }
    }
}