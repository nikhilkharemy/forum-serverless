'use strict';
var admin = require('firebase-admin');

admin.initializeApp({
	credential: admin.credential.cert({
		projectId: 'abp-manch',
		clientEmail: "firebase-adminsdk-ob5w0@abp-manch.iam.gserviceaccount.com",
		privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDTMNtLAo6RUsTl\n9phC+xzcPMg+jPJR36DHZrNLoIRxsgFWkx60KRyHiCHaeVJ+nk06Pc+23FUhUwvh\nJU3n6V3tP3HDA7rnry/6LewXwwD1cGJCTgbezjB8kd6k1jAVYu1odgcsOaAS3TMd\nZci+xWDn88O2pWmTADEmaCXenjz7dEr7cfhvg+N3g6gY2DCvYoPmiE5sIBXXbH2q\n37MMLdHUp62uuXTgpXTuIq24X13NfquME7a+pPrloq6eZl0ePnrBzD2BXJ/zENmt\nXodrhCo3Fr/hVsiCcS9b1x7QPyfXD11I4EzD4+QU5ytWH6gYadlesiOw48LHubUc\nYbnUUJWFAgMBAAECggEAEtiGBSpP/xtf+zZ3bWi7sVKSOvS4bgJy9kBNqSbEkuHD\n2U4tG/4cL+L/xF91s1tcgGFCLyr3xM7EnV2HF3Ydfd2ewPyM+f5J3X0qF4+8/un9\ntrWASvMi5AbfU53SciIfFeaMas+kn3JSTKIH2TBDXseDtEGMC4RlnmwGTxiXUAft\nwuZ2sjg7MvVaHMuOTCb/0WOTPe8thogT4ZwUM5rxQqv58pm74NqbRlBbuLc+roaH\nacSyADdmjW/vpZkE5R8TY/qBnPtKjOGpSQKsU5m8FphFBPBeKN0+9L6W/z/zFrHi\nlZ3Gaw7WilzzrrZ1YiNRKhBg3oNbb2zBswGqopWIuQKBgQD8UBejQ4BqXJSbHik8\nSNONszE0wmt7YTZkGI5mj5aFpFD4rJZOVPBHSEBYY7rlLf7vxzoR/vJl/n/t4bFm\noZFKgQylf4FCLc/paJFRmcct5s+bDbgYTM//s6CaJJkJVhHvmYtO96BSpRtqZhhY\nrVwvpfKxrosdielyC3w8kR48iQKBgQDWRu0MGDK6/MV8AUZi0mHVDshp9F17/zrM\nZrATx9e/2yUB9ZPFPmSYmgxl+7p7obB6bzwfbb8W1J60odgrEGoPlZjyzjgOTXfp\nPxoViPvIIbsQEZj4temu859KiPXkm1IvJJ55oVq7J76emc9XW+CCDpCAOr0m/xlk\nPvaZQXtqHQKBgDPcxq8RbfDu7MDhtzokAhArWB7vI6atub9jaMneE+OOffJPj2m0\nfds5F7jTbxQymydwPRh73hlm8abU8GEXLsUwt4fBKLGQtx7UFqK+SDnAKsZFUKT2\nDP8TThzBDw/jODaWyhLGRZcXRwZcy/5WTA+jPbqWFRRSR8DgaX4Nmjh5AoGAQSff\n/MV+54zlIAfjNzlxti+AkXdU1deOMYkoEVu7JwOkBSx/eoK2ZBCzpG8fDWjlGNWq\nGoRsjqyodZSg/rdHCOYcU/iQ4wh7ZdliPRoiNYDMON6g/T+ThzddQHTVEGaKXvtr\nlOCTjkVPmTp76bxuUB3NorA5xBndxrW+lmtq86ECgYEAve/YH5oqwVKJEyjb6SZR\nDDeJHA5EDeJ68PEuibRLtebH8x1yUsU/SmZPM0qGe/9d5HTBJbYsLWrrnj7O+yda\nBAuMlOEAVI8/Ap0qfA+e5/LNBah/raZzCTVWFkNiXIV+3TEOrdJsc7NqkJgpZGUG\nSNzUCPQXlZuSbyYx+KyyYwE=\n-----END PRIVATE KEY-----\n"
	  })
  })

// Initialize the default firebase app
module.exports ={
    isAuthenticated: function (idToken){
      // return idToken
      return admin.auth().verifyIdToken(idToken)
      // .then(function(decodedToken) {
      //   var uid = decodedToken.uid;
      //   if(uid == 'undefined'){
      //     return('Token has expired');
      //   }
      //   else{
      //     return('5');
      //   }
      // }).catch(function(error) {
      //   return(error);
      // });
    }
}



