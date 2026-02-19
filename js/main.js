document.addEventListener("DOMContentLoaded", () => {
  const revealGroups = document.querySelectorAll("section");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const items = entry.target.querySelectorAll(".reveal");

        items.forEach((item, index) => {
          setTimeout(() => {
            item.classList.add("visible");
          }, index * 200); // 0.2초 간격으로 순서대로 등장
        });

        observer.unobserve(entry.target); // 1번만 실행되게
      }
    });
  }, {
    threshold: 0.2
  });

  revealGroups.forEach(group => observer.observe(group));
});


(function () {
      // 안전하게 DOMContentLoaded 대기 — 외부에 붙여도 안전합니다.
      function initTabs() {
        const tabBtns = document.querySelectorAll(".tab-btn");
        const contents = document.querySelectorAll(".tab-content");

        if (!tabBtns.length || !contents.length) return;

        tabBtns.forEach(btn => {
          btn.addEventListener("click", () => {
            const targetId = btn.getAttribute("data-tab");
            if (!targetId) return;

            // 버튼 aria/active 상태 업데이트
            tabBtns.forEach(b => {
              const isActive = b === btn;
              b.classList.toggle("active", isActive);
              b.setAttribute("aria-selected", isActive ? "true" : "false");
            });

            // 콘텐츠 토글: hidden 속성과 active 클래스 사용 (접근성 & 전환)
            contents.forEach(c => {
              if (c.id === targetId) {
                c.removeAttribute("hidden");
                c.classList.add("active");
              } else {
                c.setAttribute("hidden", "");
                c.classList.remove("active");
              }
            });
          });
        });

        // 키보드 접근성 (왼/오른쪽 화살표로 탭 이동) - 선택사항
        let btnArray = Array.from(tabBtns);
        tabBtns.forEach((btn, idx) => {
          btn.addEventListener("keydown", (e) => {
            if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
              e.preventDefault();
              const dir = e.key === "ArrowRight" ? 1 : -1;
              let next = (idx + dir + btnArray.length) % btnArray.length;
              btnArray[next].focus();
              btnArray[next].click();
            }
          });
        });
      }

      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initTabs);
      } else {
        initTabs();
      }
    })();


document.addEventListener("DOMContentLoaded", () => {
  const topBtn = document.getElementById("topBtn");

  window.addEventListener("scroll", () => {
    if (window.scrollY > window.innerHeight * 1) {
      topBtn.classList.add("show");
    } else {
      topBtn.classList.remove("show");
    }
  });

  topBtn.addEventListener("click", function (e) {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
});


// 이메일 도메인 select → input 자동 반영
document.addEventListener("DOMContentLoaded", () => {
  const domainSelect = document.getElementById("emailDomain");
  const email2Input = document.getElementById("email2");

  if (domainSelect && email2Input) {
    domainSelect.addEventListener("change", () => {
      if (domainSelect.value) {
        email2Input.value = domainSelect.value;
      }
    });
  }
});


// Contact Us 폼 유효성 검증
function submitContactForm() {
  const type1 = document.getElementById("type1");
  const data1 = document.getElementById("data1");
  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const email2 = document.getElementById("email2");
  const tel = document.getElementById("tel");
  const content = document.getElementById("form_conb");
  const consent = document.getElementById("privacyConsent");

  // 문의유형
  if (!type1 || !type1.value) {
    alert("문의 유형을 선택해 주세요.");
    if (type1) type1.focus();
    return;
  }

  // 회사명
  if (!data1 || !data1.value.trim()) {
    alert("회사명을 입력해 주세요.");
    if (data1) data1.focus();
    return;
  }

  // 이름
  if (!name || !name.value.trim()) {
    alert("이름을 입력해 주세요.");
    if (name) name.focus();
    return;
  }

  // 이메일
  if (!email || !email.value.trim()) {
    alert("이메일을 입력해 주세요.");
    if (email) email.focus();
    return;
  }
  if (!email2 || !email2.value.trim()) {
    alert("이메일 도메인을 입력해 주세요.");
    if (email2) email2.focus();
    return;
  }

  // 전화번호
  if (!tel || !tel.value.trim()) {
    alert("전화번호를 입력해 주세요.");
    if (tel) tel.focus();
    return;
  }

  // 문의내용
  if (!content || !content.value.trim()) {
    alert("문의 내용을 입력해 주세요.");
    if (content) content.focus();
    return;
  }

  // 개인정보 동의
  if (!consent || !consent.checked) {
    alert("개인정보 수집 및 이용에 동의해 주세요.");
    return;
  }

  // 검증 통과
  alert("문의가 접수되었습니다. 감사합니다!\n빠른 시일 내에 답변 드리겠습니다.");

  // 폼 초기화
  if (type1) type1.selectedIndex = 0;
  if (data1) data1.value = "";
  if (name) name.value = "";
  if (email) email.value = "";
  if (email2) email2.value = "";
  if (tel) tel.value = "";
  if (content) content.value = "";
  if (consent) consent.checked = false;
}