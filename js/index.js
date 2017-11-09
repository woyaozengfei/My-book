(function() {
	var util = (function() {
		var prefix = "html_reader";
		var storgeGetter = function(key) {
			return localStorage.getItem(prefix + key);
		}
		var storgeSetter = function(key, val) {
			return localStorage.setItem(prefix + key, val);
		}
		var getJsonp = function(url, callback) {
			return $.jsonp({
				url: url,
				cache: true,
				callback: "duokan_fiction_chapter",
				success: function(result) {
					var data = $.base64.decode(result);
					var json = decodeURIComponent(escape(data));
					callback(json);
				}
			});
		}
		return {
			storgeGetter: storgeGetter,
			storgeSetter: storgeSetter,
			getJsonp: getJsonp
		}
	})();

	//	获取到的一些元素
	var dom = {
		top_nav: $("#top-nav"),
		bottom_nav: $(".bottom_nav"),
		font_container: $(".font-container"),
		font_button: $("#font-button"),
		day_icon: $("#day_icon"),
		night_icon: $("#night_icon"),
		body: $("body")
	}

	var doc = $(document);
	var win = $(window);
	var readerModel;
	var readerUI;

	//	初始化字体大小
	var initFontSize = util.storgeGetter("font_size");
	var rootContainer = $("#fiction_container");
	initFontSize = parseInt(initFontSize);
	if(!initFontSize) {
		initFontSize = 14;
	}
	$("#fiction_container").css("font-size", initFontSize);

	//   主函数
	function main() {
		readerModel = ReaderModel();
		readerUI = readerBaseFrame(rootContainer);
		readerModel.init(function(data) {
			readerUI(data);
		});
		eventHandler();
	}
	//	模拟实现阅读器数据交互
	function ReaderModel() {
		var chapter_id;
		var ChapterTotal;
		var init = function(UIcallback) {
			getFictionInfo(function() {
				getCurChapterContent(chapter_id, function(data) {
					UIcallback && UIcallback(data);
				});
			});
		}
		var getFictionInfo = function(callback) {
			$.get("data/chapter.json", function(data) {
				chapter_id=util.storgeGetter("last_chapter_id");
				if(chapter_id==null){
					chapter_id = data.chapters[1].chapter_id;
				}
				CharterTotal = data.chapters.length;
				callback && callback();
			}, "json");
		}
		var getCurChapterContent = function(chapter_id, callback) {
			$.get("data/data" + chapter_id + ".json", function(data) {
				if(data.result == 0) {
					var url = data.jsonp;
					util.getJsonp(url, function(data) {
						callback && callback(data);
					});
				}
			}, "json");
		}
		var preChapter = function(UIcallback) {
			chapter_id = parseInt(chapter_id, 10);
			if(chapter_id == 0) {
				return;
			}
			chapter_id -= 1;
			getCurChapterContent(chapter_id, UIcallback);
			util.storgeSetter("last_chapter_id",chapter_id);
		}
		var nextChapter = function(UIcallback) {
			chapter_id = parseInt(chapter_id, 10);
			if(chapter_id == ChapterTotal) {
				return;
			}
			chapter_id += 1;
			getCurChapterContent(chapter_id, UIcallback);
			util.storgeSetter("last_chapter_id",chapter_id);
		}
		return {
			init: init,
			preChapter: preChapter,
			nextChapter: nextChapter
		}
	}
	//	UI层渲染
	function readerBaseFrame(container) {
		function parseChapterData(jsonData) {
			var jsonObj = JSON.parse(jsonData);
			var html = "<h4>" + jsonObj.t + "</h4>";
			for(var i = 0; i < jsonObj.p.length; i++) {
				html += "<p>" + jsonObj.p[i] + "</p>";
			}
			return html;
		}
		return function(data) {
			container.html(parseChapterData(data));
		}
	}

	//	DOM事件操作
	function eventHandler() {
		//		设置点击弹出导航菜单
		$("#action_mid").click(function() {
			if(dom.top_nav.css("display") == "none") {
				dom.bottom_nav.show();
				dom.top_nav.show();
			} else {
				dom.bottom_nav.hide();
				dom.top_nav.hide();
				dom.font_container.hide();
			}
		});
		//		设置滚动隐藏导航菜单
		win.scroll(function() {
			dom.bottom_nav.hide();
			dom.top_nav.hide();
			dom.font_container.hide();
		});
		//		设置点击字体菜单变化字体图标颜色
		$("#font-button").click(function() {
			if(dom.font_container.css("display") == "none") {
				dom.font_container.show();
				dom.font_button.addClass("current");
			} else {
				dom.font_container.hide();
				dom.font_button.removeClass("current");
			}
		});
		//		设置点击切换白天夜间模式
		$("#night-button").click(function() {
			if(dom.day_icon.css("display") == "none") {
				dom.day_icon.show();
				dom.night_icon.hide();
				dom.body.css("background-color", "#e9dfc7");

			} else {
				dom.day_icon.hide();
				dom.night_icon.show();
				dom.body.css("background-color", "#0f1014");
			}
		});
		//		设置变换背景颜色
		$(".bk-container-1").click(function() {
			dom.body.css("background-color", "#fff");
			$(".bk-container-current").offset($(".bk-container-1").offset());
		});
		$(".bk-container-2").click(function() {
			dom.body.css("background-color", "#E9DFC7");
			$(".bk-container-current").offset($(".bk-container-2").offset());
		});
		$(".bk-container-3").click(function() {
			dom.body.css("background-color", "#A4A4A4");
			$(".bk-container-current").offset($(".bk-container-3").offset());
		});
		$(".bk-container-4").click(function() {
			dom.body.css("background-color", "#CDcfce");
			$(".bk-container-current").offset($(".bk-container-4").offset());
		});
		$(".bk-container-5").click(function() {
			dom.body.css("background-color", "#283548");
			$(".bk-container-current").offset($(".bk-container-5").offset());
		});
		$(".bk-container-6").click(function() {
			dom.body.css("background-color", "#0f1410");
			$(".bk-container-current").offset($(".bk-container-6").offset());
		});
		//     设置变换字体颜色
		$("#large-font").click(function() {
			if(initFontSize >= 20) {
				return;
			}
			initFontSize += 1;
			$("#fiction_container").css("font-size", initFontSize);
			util.storgeSetter("font_size", initFontSize);
		});
		$("#small-font").click(function() {
			if(initFontSize <= 12) {
				return;
			}
			initFontSize -= 1;
			$("#fiction_container").css("font-size", initFontSize);
			util.storgeSetter("font_size", initFontSize);
		});

		$("#prev_button").click(function() {
			readerModel.preChapter(function(data) {
				readerUI(data);
			});
		});

		$("#next_button").click(function() {
			readerModel.nextChapter(function(data) {
				readerUI(data);
			});
		});
	}
	main();
})();