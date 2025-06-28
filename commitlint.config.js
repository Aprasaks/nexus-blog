module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat", // 새로운 기능
        "fix", // 버그 수정
        "docs", // 문서 변경
        "style", // 코드 스타일 변경
        "refactor", // 코드 리팩토링
        "test", // 테스트 추가/수정
        "chore", // 빌드, 설정 변경
        "setup", // 초기 설정
      ],
    ],
    "subject-max-length": [2, "always", 50],
    "body-max-line-length": [2, "always", 72],
  },
};
