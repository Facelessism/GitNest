import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useToastStore } from "../../store/useToastStore";
import { useNavigate, Link } from "react-router-dom";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const { login, loading, error, clearError } = useAuthStore();
  const addToast = useToastStore((s) => s.addToast);
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const validate = (values) => {
    const errors = {};

    if (!values.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(values.email.trim())) {
      errors.email = "Enter a valid email address";
    }

    if (!values.password.trim()) {
      errors.password = "Password is required";
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    const newValue = type === "checkbox" ? checked : value;

    const updated = {
      ...formData,
      [name]: newValue,
    };

    setFormData(updated);

    setTouched((prev) => ({ ...prev, [name]: true }));
    setValidationErrors(validate(updated));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setValidationErrors(validate(formData));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const errors = validate(formData);
    setValidationErrors(errors);
    setTouched({ email: true, password: true });

    if (Object.keys(errors).length > 0) return;

    try {
      await login(formData.email.trim(), formData.password.trim());

      addToast({
        message: "Signed in successfully!",
        type: "success",
      });

      navigate("/");
    } catch (err) {
      // Field-level API errors
      if (
        err.response?.data?.errors &&
        Array.isArray(err.response.data.errors)
      ) {
        const fieldErrors = {};
        err.response.data.errors.forEach((error) => {
          fieldErrors[error.field] = error.message;
        });
        setValidationErrors(fieldErrors);
      }
    }
  };

  const isFormValid =
    emailRegex.test(formData.email.trim()) &&
    formData.password.trim().length > 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 transition-all">
      {/* Container */}
      <div className="w-full max-w-md animate-fadeIn">
        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Sign in
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Welcome back! Please enter your details.
            </p>
          </div>

          {/* Server error */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/30 p-3 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Email Address
              </label>

              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={!!validationErrors.email}
                aria-describedby="email-error"
                placeholder="you@example.com"
                className={`w-full px-3 py-2 rounded-md border outline-none transition focus:ring-2 focus:ring-indigo-500 ${
                  validationErrors.email
                    ? "border-red-500"
                    : "border-gray-300 dark:border-gray-700"
                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400`}
              />

              {validationErrors.email && touched.email && (
                <p id="email-error" className="text-xs text-red-500 mt-1">
                  {validationErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Password
              </label>

              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  aria-invalid={!!validationErrors.password}
                  aria-describedby="password-error"
                  placeholder="Enter your password"
                  className={`w-full px-3 py-2 rounded-md border outline-none transition focus:ring-2 focus:ring-indigo-500 ${
                    validationErrors.password
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-700"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {validationErrors.password && touched.password && (
                <p id="password-error" className="text-xs text-red-500 mt-1">
                  {validationErrors.password}
                </p>
              )}
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <input
                  type="checkbox"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                  className="accent-indigo-600"
                />
                Remember me
              </label>

              <Link
                to="/forgot-password"
                className="text-indigo-600 hover:underline dark:text-indigo-400"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!isFormValid || loading}
              className="w-full py-2.5 rounded-md text-white font-medium bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          {/* Sign up */}
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="text-indigo-600 hover:underline dark:text-indigo-400 font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Animation */}
      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.35s ease-in-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Login;
