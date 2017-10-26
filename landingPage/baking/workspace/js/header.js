function initNavigation () {
    $(".section").on("mouseover", function () {
        $("#navigation-menu-main .link").css("color", "#000000"), collapseNavigationSubmenus()
    }), $("#navigation-menu-main .link").each(function () {
        $(this).on("click mouseover", function () {
            collapseNavigationSubmenus(), $("#navigation-menu-main .link").css("color", "#000000"), $(this).css("color", "#ff6727");
            var n = $(this).data("submenu");
            expandNavigationSubmenu(n)
        })
    }), $(".navigation-menu-main-sub .link").each(function () {
        $(this).css("background-image", "url(images/common/navigation_submenu/" + $(this).text() + ".png)")
    }), $(document).on("mouseleave", function () {
        collapseNavigationSubmenus()
    })
}

function expandNavigationSubmenu (n) {
    void 0 !== n && ($("#" + n).css("height", "340px"), $("#" + n).css("visibility", "visible"))
}

function collapseNavigationSubmenus () {
    $(".navigation-menu-main-sub").css("height", "0"), $(".navigation-menu-main-sub").css("visibility", "hidden")
}

$(function () {
    initNavigation()
});
