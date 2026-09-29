const isFiniteNumber = (value) =>
  value !== null && value !== "" && Number.isFinite(Number(value));

const toFiniteNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const isMongooseError = (error) =>
  error?.name === "ValidationError" || error?.name === "CastError";

const sendModelError = (res, error, fallbackMessage = "Server error") => {
  if (error?.name === "ValidationError") {
    const message = Object.values(error.errors || {})
      .map((fieldError) => fieldError.message)
      .join(", ");

    return res.status(400).json({
      success: false,
      message: message || "Please check the submitted data",
    });
  }

  if (error?.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid record identifier",
    });
  }

  if (error?.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "A record with those values already exists",
    });
  }

  console.error(error);
  return res.status(500).json({
    success: false,
    message: fallbackMessage,
  });
};

module.exports = {
  isFiniteNumber,
  toFiniteNumber,
  sendModelError,
};
