jQuery(document).ready(function ($) {
	$(".delete-btn").click(function () {
		var userId = $(this).attr("user-id");
		$.ajax({
			type: "GET",
			url: `/admin/user/delete/${userId}`,
			dataType: "JSON",
			success: function (response) {
				console.log(response);
				location.reload();
			},
		});
	});
	$(".delete-cat").click(function () {
		var catId = $(this).attr("cat-id");
		$.ajax({
			type: "GET",
			url: `/admin/category/delete/${catId}`,
			dataType: "JSON",
			success: function (response) {
				console.log(response);
				location.reload();
			},
		});
	});

	$(".delete-product").click(function () {
		var productId = $(this).attr("product-id");
		$.ajax({
			type: "GET",
			url: `/admin/product/delete/${productId}`,
			dataType: "JSON",
			success: function (response) {
				console.log(response);
				location.reload();
			},
		});
	});

	$("#product-table").DataTable();
	$("#user-table").DataTable();
	$("#category-table").DataTable();
	$("#choseCategory").change(function () {
		var catId = $(this).val();
		$.ajax({
			url: "/get-subcat",
			type: "POST",
			data: { catId: catId },
			dataType: "JSON",
			success: function (response) {
				console.log(response.data);
				$(".subcat").html(response.data);
			},
		});
	});
	// cupon dataTable
	$("#cupon-table").DataTable();
	// delete cupon code
	$(".delete-cupon").click(function () {
		if (confirm("are you sure to delete")) {
			var cuponId = $(this).attr("cupon-id");
			$.ajax({
				url: "/admin/cupon/delete",
				type: "POST",
				data: { cuponId: cuponId },
				dataType: "JSON",
				success: function (response) {
					console.log(response);
					if (response.status == "ok") {
						location.href = location.href;
					}
				},
			});
		}
	});

	// vendor dataTable
	$("#vendorTable").DataTable();

	// delete vendor
	$(".vendorDeleteBtn").click(function () {
		let vendorId = $(this).attr("vendorId");
		$.ajax({
			url: `/admin/vendor/delete/${vendorId}`,
			type: "GET",
			dataType: "JSON",
			success: function (response) {
				console.log(response);
				if (response.status == "ok") {
					location.href = location.href;
				}
			},
		});
	});
});
