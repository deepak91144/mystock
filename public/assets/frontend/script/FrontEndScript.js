jQuery(document).ready(function ($) {
	$(".add-to-cart").click(function () {
		var productId = $(this).attr("product-id");
		var price = parseInt($(this).prev().html());

		$.ajax({
			url: `/add-to-cart/${productId}/${price}`,
			type: "GET",
			dataType: "JSON",
			success: function (response) {
				console.log(response);
				getCartData();
				$(".cart-res").html(response.message);
				$(".cart-res").fadeIn();
				setTimeout(function () {
					$(".cart-res").fadeOut();
				}, 3000);
			},
		});
	});
	$(".delete-product-from-cart").click(function () {
		const productId = $(this).attr("product-id");
		$.ajax({
			url: `cart/delete/${productId}`,
			type: "GET",
			dataType: "JSON",
			success: function (response) {
				console.log(response);
				location.href = location.href;
				getCartData();
			},
		});
	});
	$(".plus").click(function () {
		var qty = $(this).prev().val();
		var currentObject = $(this);
		var productPrice = parseInt($(this).parent("td").next("td").html());
		qty++;
		const productId = $(this).prev().attr("product-id");
		$.ajax({
			url: `cart/update/${productId}/${qty}?plus=true&productPrice=${productPrice}`,
			type: "GET",
			dataType: "JSON",
			success: function (response) {
				console.log(response);
				currentObject.prev().val(qty);
				currentObject
					.parent("td")
					.siblings("td.price-td")
					.find(".price")
					.html(response.currentUpdatePrice);
				$(".cart-total").html(response.cartTotal);
			},
		});
	});

	$(".minus").click(function () {
		var productPrice = parseInt($(this).parent("td").next("td").html());
		var qty = $(this).parent("td").find(".qty-update").val();
		var currentObject = $(this);
		if (qty > 1) {
			qty--;

			const productId = $(this)
				.parent("td")
				.find(".qty-update")
				.attr("product-id");
			$.ajax({
				url: `cart/update/${productId}/${qty}?minus=true&productPrice=${productPrice}`,
				type: "GET",
				dataType: "JSON",
				success: function (response) {
					console.log(response);
					currentObject.parent("td").find(".qty-update").val(qty);

					currentObject
						.parent("td")
						.siblings("td.price-td")
						.find(".price")
						.html(response.currentUpdatePrice);
					$(".cart-total").html(response.cartTotal);
				},
			});
		} else {
			alert("cant decrease");
			return;
		}
	});

	$("#user-register").submit(function (e) {
		e.preventDefault();
		var formData = new FormData(this);
		var name = $("#register-name").val();
		var email = $("#register-email").val();
		var password = $("#register-password").val();

		var errMsg = "";
		var isValid = true;
		if (name.length < 2) {
			isValid = false;
		}
		if (email.length < 2) {
			isValid = false;
		}
		if (password.length < 5) {
			isValid = false;
		}
		if (isValid == false) {
			$("#err-msg").fadeIn();
			$("#err-msg").html("each field is mandtory exceptt image");
			$("#err-msg").css("color", "red");
			setTimeout(function () {
				$("#err-msg").fadeOut();
			}, 3000);
			return;
		}

		$.ajax({
			url: "/signup",
			type: "POST",
			data: formData,
			contentType: false,
			processData: false,
			dataType: "JSON",
			success: function (response) {
				$("#err-msg").fadeIn();
				if (response.status == "ok") {
					location.href = location.href;
				}
				if (response.status == "error") {
					console.log(response);
					$("#err-msg").html("email already exist");
					$("#err-msg").css("color", "red");
					setTimeout(function () {
						$("#err-msg").fadeOut();
					}, 3000);
				}
			},
		});
	});
	$("#user-login").submit(function (e) {
		e.preventDefault();
		$.ajax({
			url: "/login",
			type: "POST",
			data: $("#user-login").serialize(),
			dataType: "JSON",
			success: function (response) {
				console.log(response);
				if (response.status == "ok") {
					location.href = location.href;
				} else {
					$("#res").html("invalid email or password");
				}
			},
		});
	});
	$("#place-order").click(function (e) {
		e.preventDefault();
		$.ajax({
			url: "/check-session",
			type: "get",
			dataType: "JSON",
			success: function (response) {
				console.log(response);
				if (response.status == "ok") {
					$("#order-form").trigger("submit");
				}
				if (response.status == "error") {
					$(".error-msg").html("you have to login first");
				}
			},
		});
	});

	function getCartData() {
		$.ajax({
			url: "/cart-details",
			type: "GET",
			dataType: "JSON",
			success: function (response) {
				$(".cart i").html(response.numberOfProduct);
			},
		});
	}
	getCartData();
	$(".cart i").click(function () {
		location.href = "/cart";
	});

	$(".wishlist i").click(function () {
		const productId = $(this).attr("product-id");
		const currentObject = $(this);
		var wishlist = $(this).attr("wishlist");

		$.ajax({
			url: "/add-to-wishlist",
			type: "POST",
			data: { productId: productId },
			success: function (response) {
				if (response.message == "no") {
					location.href = "/login";
				} else {
					getwishListData();

					currentObject
						.parent(".wishlist")
						.siblings(".wishlist-res")
						.html(response.message);
					currentObject.parent(".wishlist").siblings(".wishlist-res").fadeIn();
					setTimeout(function () {
						currentObject
							.parent(".wishlist")
							.siblings(".wishlist-res")
							.fadeOut();
					}, 2000);
				}
			},
		});
	});
	$(".wishlist-cart i").click(function () {
		location.href = "/wishlist";
	});
	$(".delete-wishlist-product").click(function (e) {
		var productId = $(this).attr("product-id");

		$.ajax({
			url: "/wishlist/delete",
			type: "POST",
			data: { productId: productId },
			dataType: "JSON",
			success: function (response) {
				if (response.status == "ok") {
					location.href = "/wishlist";
				}
			},
		});
	});
	function getwishListData() {
		$.ajax({
			url: "/wishlist-data",
			type: "GET",
			dataType: "JSON",
			success: function (response) {
				$(".wishlist-cart i").html(response.numberOfProducts);
			},
		});
	}
	getwishListData();

	$("#wishlist-table").DataTable();

	$("#sendotp").click(function (e) {
		e.preventDefault();
		var email = $("#register-email").val();
		$(this).fadeIn();
		$("#otpbox").fadeIn();
		$("#verify-otp").fadeIn();
		$(this).fadeOut();
		if (email != "") {
			$.ajax({
				url: "/send-otp",
				type: "POST",
				data: { email: email, otp: Math.random() },
				success: function (response) {
					console.log(response);
					document.cookie = `otp= ${response.otp}`;
				},
			});
		}
	});
	$("#verify-otp").click(function (e) {
		e.preventDefault();
		var otp = $("#otpbox").val();

		if (otp == "") {
			alert("enter valid otp");
		} else {
			$.ajax({
				url: "/verify-otp",
				type: "POST",
				data: { otp: otp },
				success: function (response) {
					console.log(response);
					if (response.status == "ok") {
						$("#submit-btn").removeAttr("disabled");
						$("#otpbox").fadeOut();
						$("#verify-otp").fadeOut();
						$("#otpbox").remove();
					} else {
						$("#otp-res").fadeIn().html("invalid otp");
						setTimeout(function () {
							$("#otp-res").fadeOut();
						}, 3000);
					}
				},
			});
		}
	});

	$("#apply").click(function () {
		var cupon = $("#cupon-input").val();
		if (cupon == "") {
			alert("enter valid cupon");
		} else {
			$.ajax({
				url: "/cupon-opp",
				type: "POST",
				data: { cupon: cupon },
				dataType: "JSON",
				success: function (response) {
					console.log(response);
					$(".cupon .response").html(response.message);
					$(".cupon .response").fadeIn();
					setTimeout(function () {
						$(".cupon .response").fadeOut();
					}, 3000);
					if (response.status == "ok") {
						$(".total").html(response.cartTotalAfterCuponApplied);
					}
				},
			});
		}
	});

	//script for save rating into database
	$("#rating-form").submit(function (e) {
		e.preventDefault();
		const pathName = location.pathname;
		var pathnameInArr = pathName.split("/");
		var productId = pathnameInArr["2"];

		$.ajax({
			url: "/save-rating",
			type: "post",
			data: { productId: productId, formData: $("#rating-form").serialize() },
			dataType: "JSON",
			success: function (response) {
				console.log(response);
				$(".rate-res").html(response.message).fadeIn();
				setTimeout(function () {
					$(".rate-res").fadeOut();
				}, 3000);
				location.href = location.href;
			},
		});
	});
});
