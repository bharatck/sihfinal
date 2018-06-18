const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.assignUid = functions.database.ref('/curr_uid').onWrite((change,context) => {

    const activeFinder = admin.database().ref(`/Active/value`).once('value');
    return activeFinder.then(activeFinderRes => {

        const activeRes = activeFinderRes.val();
        if(activeRes === true) {

            const tktNumberFinder = admin.database().ref(`/Active/generated_num`).once('value');
            return tktNumberFinder.then(tktNumberRes => {
                const tktNumber = tktNumberRes.val();

                const numBagsFinder = admin.database().ref(`/Active/num_bags`).once('value');
                return numBagsFinder.then(numBagsRes => {
                    const numBags = numBagsRes.val();

                    const valueFinder = admin.database().ref(`/sih/${tktNumber}`).once('value');
                    return valueFinder.then(valueRes => {

                        console.log('Value is: ',valueRes.val());
                        var jsonObject = valueRes.val();
                        var i = 0;
                        for(i = 0 ; i < numBags ; i++) {
                            var currJson = jsonObject[i];
                            if(!currJson.hasOwnProperty('uid')) {
                                break;
                            }
                        }
                        console.log(i);
                        if(numBags-1 == i) {
                            admin.database().ref(`/sih/${tktNumber}/${i}/uid`).set(change.after.val());
                            admin.database().ref(`/mappings/${change.after.val()}/generated_tkt`).set(tktNumber.toString());
                            admin.database().ref(`/mappings/${change.after.val()}/bag_id`).set(i);
                            admin.database().ref(`/Active/value`).set(false);
                        }
                        else if(numBags == i) {
                            admin.database().ref(`/Active/value`).set(false);
                        }
                        else {
                            admin.database().ref(`/sih/${tktNumber}/${i}/uid`).set(change.after.val());
                            admin.database().ref(`/mappings/${change.after.val()}/generated_tkt`).set(tktNumber.toString());
                            admin.database().ref(`/mappings/${change.after.val()}/bag_id`).set(i);
                        }

                    });
                });
            });
        }
    });
});


exports.sendAlert = functions.database.ref('/sih/{booking_id}/{bag_id}/Status/{check_point}/status').onWrite((change,context) => {

    const booking_id = context.params.booking_id;
    const bag_id = context.params.bag_id;
    const check_point = context.params.check_point;
    var bag_num = parseInt(bag_id);
    var chkpnt = parseInt(check_point);
    bag_num++;
    if(change.after.val() == true && chkpnt == 3) {

        console.log(`Bag number ${bag_id} for booking id ${booking_id} passed stage ${check_point}`);
        const tokenFinder = admin.database().ref(`/sih/${booking_id}/device_token`).once('value');
        return tokenFinder.then(tokenRes => {
            const deviceToken = tokenRes.val();
            console.log(deviceToken);
            const payload = {
              notification : {
                  title : 'Bag Reached' ,
                  body : `Your bag ${bag_num} just entered the flight.` ,
                  sound : 'default',
                  icon : "https://firebasestorage.googleapis.com/v0/b/testing-200101.appspot.com/o/aeroplane.png?alt=media&token=9ea8c229-8ba0-4d7b-b43b-4f9de2a1f602"
              }
            };
            admin.messaging().sendToDevice(deviceToken,payload).then(response => {
                return console.log(payload);
            });
        });
    }
    if(change.after.val() == true && check_point == "exit") {

        console.log(`Bag number ${bag_id} for booking id ${booking_id} passed stage ${check_point}`);
        const tokenFinder = admin.database().ref(`/sih/${booking_id}/device_token`).once('value');
        return tokenFinder.then(tokenRes => {
            const deviceToken = tokenRes.val();
            console.log(deviceToken);
            const payload = {
                notification : {
                    title : 'Bag Reached' ,
                    body : `Your bag ${bag_num} is waiting to exit.` ,
                    sound : 'default',
                    icon : "https://firebasestorage.googleapis.com/v0/b/testing-200101.appspot.com/o/aeroplane.png?alt=media&token=9ea8c229-8ba0-4d7b-b43b-4f9de2a1f602"
                }
            };
            admin.messaging().sendToDevice(deviceToken,payload).then(response => {
                return console.log(payload);
            });
        });
    }
});