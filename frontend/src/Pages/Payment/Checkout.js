import React, { useEffect } from "react";
import Layout from "../../Layout/Layout";
import { BiRupee } from "react-icons/bi";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getRazorPayId,
  createCourseOrder,
  verifyCoursePayment,
} from "../../Redux/razorpaySlice";
import { refreshUserData } from "../../Redux/authSlice";
import { toast } from "react-hot-toast";

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state: locationState } = useLocation();
  const course = locationState?.course;

  const razorPayKey = useSelector((state) => state.razorpay.key);
  const order_id = useSelector((state) => state.razorpay.order_id);
  const courseIdForOrder = useSelector((state) => state.razorpay.courseIdForOrder);
  const userData = useSelector((state) => state.auth.data);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        toast.error("Failed to load payment gateway. Please try again.");
        resolve(null);
      };
      document.body.appendChild(script);
    });
  };

  const handleBuyCourse = async (event) => {
    event.preventDefault();
    if (!course) {
      toast.error("Please select a course first");
      return;
    }
    if (!razorPayKey || !order_id || courseIdForOrder !== course._id) {
      toast.error("Please wait, payment is loading...");
      return;
    }

    await loadRazorpayScript();
    if (!window.Razorpay) return;

    const options = {
      key: razorPayKey,
      order_id: order_id,
      name: "CourseEnrol",
      description: course?.title || "Course purchase",
      handler: async function (response) {
        toast.success("Payment Successful");
        const res = await dispatch(
          verifyCoursePayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            courseId: course._id,
          })
        );
        if (res?.payload?.success) {
          await dispatch(refreshUserData());
          navigate("/checkout/success");
        } else {
          navigate("/checkout/fail");
        }
      },
      prefill: {
        name: userData?.fullName ?? "",
        email: userData?.email ?? "",
      },
      theme: { color: "#F37254" },
    };
    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  useEffect(() => {
    if (!course) {
      navigate("/courses", { replace: true });
      return;
    }
    (async () => {
      await dispatch(getRazorPayId());
      await dispatch(createCourseOrder(course._id));
    })();
  }, [course, dispatch, navigate]);

  if (!course) return null;

  return (
    <Layout>
      <form
        onSubmit={handleBuyCourse}
        className="min-h-[90vh] flex items-center justify-center text-white"
      >
        <div className="w-80 h-[26rem] flex flex-col justify-center shadow-[0_0_10px_black] rounded-lg relative">
          <h1 className="bg-yellow-500 absolute top-0 w-full text-center py-4 text-2xl font-bold rounded-tl-lg rounded-tr-lg">
            Buy Course
          </h1>

          <div className="px-4 space-y-5 text-center">
            <p className="text-[17px] font-semibold text-yellow-500 line-clamp-2">
              {course.title}
            </p>
            <p className="flex items-center justify-center gap-1 text-2xl font-bold text-yellow-500">
              <BiRupee /> <span>4000</span> only
            </p>
            <div className="text-gray-200">
              <p>100% refund at cancellation</p>
              <p>* Terms & Condition Applied</p>
            </div>
          </div>

          <button
            type="submit"
            className="bg-yellow-500 hover:bg-yellow-600 transition-all ease-in-out duration-300 absolute bottom-0 w-full text-center py-2 text-xl font-bold rounded-bl-lg rounded-br-lg"
          >
            Buy Now
          </button>
        </div>
      </form>
    </Layout>
  );
};

export default Checkout;
