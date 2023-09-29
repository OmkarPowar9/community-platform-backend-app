export function failed_response(message, content = {}) {
  return {
    status: false,
    content,
    message,
  };
}

export function success_response(message, content = {}) {
  return {
    status: true,
    content,
    message,
  };
}
