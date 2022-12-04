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
const { AsyncLocalStorage } = require('async_hooks');
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
    },
    createAccount:async (body)=>{ 
        const user=await db.any('select * from "USERS" where "USERS"."username"=${username}',{username:body.username})
        if (user.length>0) return -1;
        var pwHashed=CryptoJS.SHA3(body.pw+secretKey, { outputLength: 512 }).toString(CryptoJS.enc.Base64)
        const rs=await db.none('Insert into "USERS"(username,password) Values(${user},${pw})',{user:body.username,pw:pwHashed}).then((result)=>{
            if (result) return -1
        });
    },
    checkSignIn:async (body)=>{
        const user=await db.any('select * from "USERS" where "USERS"."username"=${username}',{username:body.username})
        if (user.length==0) return -1;
        var pwHashed=CryptoJS.SHA3(body.password+secretKey, { outputLength: 512 }).toString(CryptoJS.enc.Base64);
        return (user[0].password==pwHashed)
    },
    getTopRating:async (perPage,page)=>{
        const rs=await db.any('Select * from "MOVIES" where "Rating" is not NULL order by "Rating" desc limit $1 offset $2',[perPage,page])
        return rs
    },
    getMovie: async(id)=>{
        const rs=await db.any('Select * from "MOVIES" where "Id"=$1',[id])
        return rs
    },
    getActor: async(idMovie)=>{
        const rs=await db.any('Select * from "CASTSINMOVIE" where "MovieID"=$1',[idMovie])
        return rs
    },
    getProfileActor: async(idActor)=>{
        const rs=await db.any('Select * from "CASTS" where "Id"=$1',[idActor])
        return rs
    },
    getMoveOfActor:async(idActor)=>{
        const rs=await db.any('Select * from "CASTSINMOVIE","MOVIES" where "CASTSINMOVIE"."CastID"=$1 and "CASTSINMOVIE"."MovieID"="MOVIES"."Id" and "MOVIES"."Rating" is not NULL order by "MOVIES"."Rating" desc limit 5',[idActor])
        return rs
    },
    seachMovie:async(keyword,perPage,page)=>{
        keyword="%"+keyword+"%"
        const rs=await db.any('SELECT * FROM "MOVIES" where LOWER("Title") like LOWER($1) limit $2 offset $3',[keyword,perPage,page])
        return rs
    },
    seachAllMovie:async(keyword)=>{
        keyword="%"+keyword+"%"
        const rs=await db.any('SELECT * FROM "MOVIES" where LOWER("Title") like LOWER($1)',[keyword])
        return rs
    },
    addFavourite: async(body)=>{
        const rs= await db.one('Insert into "FAVOURITEMOVIES"("User","Movie") Values($1,$2) ON CONFLICT DO NOTHING RETURNING 1',[body.user,body.Movie])
        .catch(error=>{
            console.log(error)
            return 0
        })
        return ( Object.keys(rs).length>0)
    },
    getFavourite: async(user)=>{
        const rs=await db.any('Select "Movie" From "FAVOURITEMOVIES" where "User"=$1 ',[user])
        return rs
    },
    delFavourite: async(body)=>{
        const rs= await db.one('Delete from "FAVOURITEMOVIES" where "User"=$1 and "Movie"=$2 RETURNING 1',[body.user,body.Movie])
        .catch(error=>{
            console.log(error)
            return 0
        })
        return ( Object.keys(rs).length>0)
    },
    getFavouriteList: async(user)=>{
        const rs=await db.any('Select * From "FAVOURITEMOVIES","MOVIES" where "FAVOURITEMOVIES"."User"=$1 and "FAVOURITEMOVIES"."Movie"="MOVIES"."Id"',[user])
        return rs
    },
    getReview: async(MovieId,perPage,page)=>{
        const rs=await db.any('SELECT * FROM "REVIEWS" where "Movie"=$1 order by "Id" limit $2 offset $3',[MovieId,perPage,page])
        return rs
    },
    getSizeReview: async(MovieId)=>{
        const rs=await db.one('SELECT count(*) as "SIZE" FROM "REVIEWS" where "Movie"=$1',[MovieId])
        return rs
    }
}