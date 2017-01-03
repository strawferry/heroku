

let express = require('express');
let app = express();
let CodePush = require("code-push");
let codePush = new CodePush("5oiDFwXaM1M0WdBFpiCD6OHoueTSNJjZ-5v9W");

const iOS = 'hxlivei';
const Android = 'hxlivea';

app.get('/getDeploymentMetrics', function (req, res) {
  // req.query.appName  req.query.deploymentName
  codePush.getDeploymentMetrics("hxlivei", 'Store1.2').then((resu)=>{
    console.log(resu);
    res.send(resu);
  }).catch((err)=>{
    console.log(err);
    res.send(err);
  })
});
app.get('/getDeployment', function (req, res) {
  // req.query.appName  req.query.deploymentName
  codePush.getDeployment("hxlivei", 'Store1.1').then((resu)=>{
    console.log(resu);
    res.send(resu);
  }).catch((err)=>{
    console.log(err);
    res.send(err);
  })
});
app.get('/getDeploymentHistory', function (req, res) {
  // req.query.appName  req.query.deploymentName
  codePush.getDeploymentHistory("hxlivei", 'Store1.1').then((resu)=>{
    console.log(resu);
    res.send(resu);
  }).catch((err)=>{
    console.log(err);
    res.send(err);
  })
});
app.get('/getApps', function (req, res) {
    codePush.getApps().then((resu)=>{
        console.log(resu);
        res.send(resu);
    }).catch((err)=>{
        console.log(err);
        res.send(err);
    })
});
app.get('/getApp', function (req, res) {
    console.log(req.query.appname);
    codePush.getApp(req.query.appname).then((resu)=>{
        console.log(resu);
        res.send(resu);
    }).catch((err)=>{
      console.log('-----err-----');
        console.log(err);
        res.send(err);
    })
});
app.get('/getDeployments', function (req, res) {
    console.log(req.query.appname);
    codePush.getDeployments(req.query.appname).then((resu)=>{
        console.log(resu);
        res.send(resu);
    }).catch((err)=>{
      console.log('-----err-----');
        console.log(err);
        res.send(err);
    })
});
app.get('/rollback', function (req, res) {
    // appName: string, deploymentName: string, targetRelease?: string
    console.log(req.query.appname);
    codePush.getDeployments(req.query.appname).then((resu)=>{
        console.log(resu);
        res.send(resu);
    }).catch((err)=>{
      console.log('-----err-----');
        console.log(err);
        res.send(err);
    })
});

app.get('/all', function (req, response) {
    // appName: string, deploymentName: string, targetRelease?: string
    Promise.all([codePush.getApp(iOS), codePush.getApp(Android)]).then((res) => {
        //console.log(res);
        // console.log(res[0]);
        // console.log(res[1]);
        /*
         [ { name: 'hxlivei', collaborators: { 'public@hi-one.com.cn': [Object] },
         deployments: [ 'PrePush1.1', 'PrePush1.2', 'Store1.1', 'Store1.2' ] },
         { name: 'hxlivea', collaborators: { 'public@hi-one.com.cn': [Object] },
         deployments: [ 'PrePush', 'PrePush1.1', 'Production', 'Staging', 'Store1.1' ] } ]
         */
        // codePush.getDeploymentHistory("hxlivei", 'Store1.1')
        // codePush.getDeploymentMetrics("hxlivei", 'Store1.1')
        let iOSDep = res[0].deployments;
        let andDep = res[1].deployments;
        let iOSHistoryReq = iOSDep.map((item, index)=>{
            return codePush.getDeploymentHistory(iOS, item);
        });
        let andHistoryReq = andDep.map((item, index)=>{
            return codePush.getDeploymentHistory(Android, item);
        });
        let iOSMetricsReq = iOSDep.map((item, index)=>{
            return codePush.getDeploymentMetrics(iOS, item);
        });
        let andMetricsReq = andDep.map((item, index)=>{
            return codePush.getDeploymentMetrics(Android, item);
        });

        Promise.all([...iOSHistoryReq, ...andHistoryReq, ...iOSMetricsReq, ...andMetricsReq]).then((res1) => {
            console.log(res1);
            // response.send(res1);

            let iOSdeployments = iOSDep.map((item, index, items)=>{
                let a = {};
                let temp = res1[index];
                let temp2 = temp.map((item1, index1)=>{
                    if (res1[index + iOSDep.length + andDep.length].hasOwnProperty(item1.label)){
                        console.log('---------------------a.label-------------------------');
                        console.log(item1.label);
                        console.log(res1[index + iOSDep.length + andDep.length][item1.label]);
                        item1["Metrics"] = res1[index + iOSDep.length + andDep.length][item1.label];
                        return item1;
                    }else{
                        console.log('---------------------没有-------------------------');
                        // item1["Metrics"] = {};
                        return item1;
                    }
                });
                a[item] =  temp2;
                return a;
            });
            let Androiddeployments = andDep.map((item, index)=>{
                let a = {};
                let temp = res1[iOSDep.length + index];
                let temp2 = temp.map((item1, index1)=>{
                    if (res1[index + iOSDep.length + andDep.length + iOSDep.length].hasOwnProperty(item1.label)){
                        console.log('---------------------a.label-------------------------');
                        console.log(item1.label);
                        console.log(res1[index + iOSDep.length + andDep.length + iOSDep.length][item1.label]);
                        item1["Metrics"] = res1[index + iOSDep.length + andDep.length + iOSDep.length][item1.label];
                        return item1;
                    }else{
                        console.log('---------------------没有-------------------------');
                        // item1["Metrics"] = {};
                        return item1;
                    }
                });
                a[item] =  temp2;
                return a;
            });
            let lastArr = {
                "iOS": {
                    "AppName": res[0].name,
                    "deployments": iOSdeployments
                },
                "Android": {
                    "AppName": res[0].name,
                    "deployments": Androiddeployments
                }
            };
            response.send(lastArr);


        }).catch((err1) => {
            console.log('-----err-----');
            console.log(err1);
        });
    }).catch((err) => {
        console.log('-----err-----');
        console.log(err);
    });
});




app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
