import { css } from "@/styled-system/css";

export default () => {
  const container_style = css({
    marginTop: 16,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  });

  const text_prime_style = css({
    fontSize: "2xl",
    fontWeight: "bold",
    textAlign: "center",
  });

  const text_sub_style = css({
    fontWeight: "semibold",
    color: "gray.600",
  });

  return (
    <div className={container_style}>
      <div>
        <div className={text_prime_style}>Asahi</div>
        <div className={text_sub_style}>My first name</div>
      </div>
      <div className={text_prime_style}>+</div>
      <div>
        <div className={text_prime_style}>"1984"</div>
        <div className={text_sub_style}>George Orwell's novel</div>
      </div>
    </div>
  );
};
