import React, { useCallback, useEffect, useState } from "react";
import querystring from "query-string";
import axios from "axios";
import { useHistory, useLocation } from "react-router";
const baseUrl = process.env.SERVER_URL; // "http://localhost:5000/api/user";
export default function Form() {
  const location = useLocation();
  const history = useHistory();
  const [invalidUser, setInvalidUser] = useState("");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [newPassword, setNewPassword] = useState({
    password: "",
    confirmPassword: "",
  });

  const { token, id } = querystring.parse(location.search);

  const verifyToken = async () => {
    try {
      const { data } = await axios(
        `${baseUrl}/verify-token?token=${token}&id=${id}`
      );
      setBusy(false);
    } catch (error) {
      if (error?.response?.data) {
        const { data } = error.response;
        if (!data.success) return setInvalidUser(data.error);

        return console.log(error.response.data);
      }
      console.log(error);
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  const handleOnChange = ({ target }) => {
    const { name, value } = target;
    setNewPassword({ ...newPassword, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { password, confirmPassword } = newPassword;
    if (password.trim().length < 8 || confirmPassword.trim().length > 20) {
      return setError("Password must be 8 to 20 characters long");
    }

    if (password !== confirmPassword) {
      return setError("Password doesnot match");
    }
    try {
      setBusy(true);
      const { data } = await axios.post(
        `${baseUrl}/reset-password?token=${token}&id=${id}`,
        { password }
      );
      setBusy(false);

      if (data.success) {
        setSuccess(true);
        history.replace("/reset-password");
      }
    } catch (error) {
      setBusy(false);
      if (error?.response?.data) {
        const { data } = error.response;
        if (!data.success) return setError(data.error);

        return console.log(error.response.data);
      }
      console.log(error);
    }
  };
  if (success)
    return (
      <div className="max-w-screen-sm m-auto pt-40">
        <h1 className="text-center text-3xl text-gray-500 mb-3">
          Password Reset Successfull
        </h1>
      </div>
    );
  if (invalidUser)
    return (
      <div className="max-w-screen-sm m-auto pt-40">
        <h1 className="text-center text-3xl text-gray-500 mb-3">
          {invalidUser}
        </h1>
      </div>
    );
  if (busy)
    return (
      <div className="max-w-screen-sm m-auto pt-40">
        <h1 className="text-center text-3xl text-gray-500 mb-3">
          Wait for a moment verifying reset token.
        </h1>
      </div>
    );
  return (
    <div className="max-w-screen-sm m-auto pt-40">
      <h1 className="text-center text-3xl text-gray-500 mb-3">
        Reset Password
      </h1>
      <form
        onSubmit={handleSubmit}
        action=""
        className="shadow w-full rounded-lg p-10"
      >
        {error && (
          <p className="text-center p-2 mb-3 bg-red-500 text-white">{error}</p>
        )}
        <div className="space-y-8">
          <input
            type="password"
            placeholder="********"
            name="password"
            onChange={handleOnChange}
            className="px-3 text-lg h-10 w-full border-gray-500 border-2 rounded"
          />

          <input
            type="password"
            placeholder="********"
            name="confirmPassword"
            onChange={handleOnChange}
            className="px-3 text-lg h-10 w-full border-gray-500 border-2 rounded"
          />
          <input
            type="submit"
            value="Reset Password"
            className="bg-gray-500 w-full py-3 text-white rounded"
          />
        </div>
      </form>
    </div>
  );
}
