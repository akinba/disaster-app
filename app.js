const axios = require('axios');
const os	=	require('os');
const Sequelize = require('sequelize');
if (os.hostname()=='raspi') {
	var sequelize = new Sequelize("postgres://postgres:pi@localhost:5432/maks");
} else {
	var sequelize = new Sequelize("postgres://postgres:pi@www.akinba.com:5432/maks"
		,{logging:false}
		);
}
const Earthquake = sequelize.define('earthquake', {
	id: {type: Sequelize.STRING, primaryKey: true},
    mag: {type: Sequelize.DECIMAL},
    place: {type: Sequelize.STRING},
    time: {type: Sequelize.BIGINT},
    updated: {type: Sequelize.BIGINT},
    tz: {type: Sequelize.INTEGER},
    url: {type: Sequelize.STRING},
    detail: {type: Sequelize.STRING},
    felt: {type: Sequelize.INTEGER},
    cdi: {type: Sequelize.DECIMAL},
    mmi: {type: Sequelize.DECIMAL},
    alert: {type: Sequelize.STRING},
    status: {type: Sequelize.STRING},
    tsunami: {type: Sequelize.INTEGER},
    sig: {type: Sequelize.INTEGER},
    net: {type: Sequelize.STRING},
    code: {type: Sequelize.STRING},
    ids: {type: Sequelize.STRING},
    sources: {type: Sequelize.STRING},
    types: {type: Sequelize.STRING},
    nst: {type: Sequelize.INTEGER},
    dmin: {type: Sequelize.DECIMAL},
    rms: {type: Sequelize.DECIMAL},
    gap: {type: Sequelize.DECIMAL},
    magType: {type: Sequelize.STRING},
    type: {type: Sequelize.STRING},
    geom: {type: Sequelize.GEOGRAPHY('POINTZ')}
},{
	freezeTableName: true,
	underscored: true,
	paranoid: true
});

sequelize.sync({force:false}).then((info)=>{
	//console.log(info);
});

var urlH='https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson'
var urlW='https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'
var urlM='https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson'

axios.get(urlH)
	.then( (res)=>{
		//console.log(res.data.features[0]);
		res.data.features.forEach((feature)=>{
			//console.log(feature);
			Earthquake.upsert({
				id: feature.id,
				mag:feature.properties.mag,
				place:feature.properties.place,
				time:feature.properties.time,
				updated:feature.properties.updated,
				tz:feature.properties.tz,
				url:feature.properties.url,
				detail:feature.properties.detail,
				felt:feature.properties.felt,
				cdi:feature.properties.cdi,
				mmi:feature.properties.mmi,
				alert:feature.properties.alert,
				status:feature.properties.status,
				tsunami:feature.properties.tsunami,
				sig:feature.properties.sig,
				net:feature.properties.net,
				code:feature.properties.code,
				ids:feature.properties.ids,
				sources:feature.properties.sources,
				types:feature.properties.types,
				nst:feature.properties.nst,
				dmin:feature.properties.dmin,
				rms:feature.properties.rms,
				gap:feature.properties.gap,
				magType:feature.properties.magType,
				type:feature.properties.type,
				geom:feature.geometry
			}).then(res=>{
				console.log(res);
			}).catch(err=>{
				console.log(err);
			});
		});
	});



const Koa = require('koa');
const app = new Koa();
const Router = require('koa-router');
const router = new Router();
const render = require('koa-ejs');
const join = require('path').join;

app.use(router.routes());
app.use(router.allowedMethods());
app.use(require('koa-bodyparser')({
    // BodyParser options here
}));
render(app, {
    root: join(__dirname,'views'),
    layout: false,
    viewExt: 'html',
    cache: false,
    debug: false
})

router.get('/', async (ctx,next)=>{
/*		var eq= Earthquake.findAll()
			.then(async (data)=>{
				//console.log(data);
				await data;
			});*/
	var eq= await Earthquake.findAll();
	//console.log(eq);
     await ctx.render('index',{earthquake: JSON.stringify(eq)});
});

app.use(router.routes());

app.listen(3000);