/**
 * Created by yr on 2017/7/24.
 */
var gulp = require('gulp');
var ejs = require("gulp-ejs")

gulp.task('ejs',function(){
	return gulp.src("./views/m/appshare/parts.ejs")
		.pipe(ejs({
			msg: "Hello Gulp!"
		}))
		.pipe(gulp.dest("./views/m/appshare/parts_b.ejs"))
})


gulp.task('release', ['ejs'], function () {
	//return del(['./release'])
});
