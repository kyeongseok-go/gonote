// 앱 안의 사용법. **회의 직전에 처음 여는 사람**을 위한 글이다.
//
// 문서를 따로 두면(docs/GUIDE.md) 회의 중에 못 읽는다. 폰 안에서 30초에 훑을 수 있어야 한다.
// 그래서 순서대로, 할 일만, 짧게 적었다.
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import './help.css'

export function HelpScreen() {
  return (
    <main className="hlp">
      <header className="hlp__top">
        <Link to="/" className="hlp__back" aria-label="회의 목록으로">
          <ChevronLeft size={22} aria-hidden="true" />
        </Link>
        <h1>사용법</h1>
      </header>

      <section className="hlp__block">
        <h2>회의 시작할 때</h2>
        <ol className="hlp__steps">
          <li>
            <strong>폰 음성 메모로 녹음을 켠다.</strong> 이게 1순위예요. 화면이 꺼져도 안 끊겨요
          </li>
          <li>
            gonote 에서 <strong>회의 시작</strong>
          </li>
          <li>
            <strong>“폰으로 녹음 시작했어요”</strong> 를 누른다 → 적는 줄마다 녹음 시각이 붙어요
          </li>
          <li>회의 틀을 누르면 안건이 깔려요 (제직회·당회 등)</li>
          <li>맨 위 제목을 누르면 참석 체크를 할 수 있어요</li>
        </ol>
      </section>

      <section className="hlp__block">
        <h2>적는 법</h2>
        <p className="hlp__lead">
          아래에서 <strong>종류를 고르고 → 적고 → 넣기</strong>. 이게 전부예요.
        </p>
        <dl className="hlp__kinds">
          <div>
            <dt>발언</dt>
            <dd>누가 무슨 말을 했을 때</dd>
          </div>
          <div>
            <dt>결정</dt>
            <dd>정해졌을 때 — 회의록 맨 위에 번호가 붙어요</dd>
          </div>
          <div>
            <dt>할 일</dt>
            <dd>누가 뭘 맡았을 때 — 표로 나와요</dd>
          </div>
          <div>
            <dt>보고</dt>
            <dd>숫자·사실이 보고될 때</dd>
          </div>
          <div>
            <dt>메모</dt>
            <dd>나만 보려고 — 아무 데도 안 나가요</dd>
          </div>
        </dl>
        <ul className="hlp__tips">
          <li>
            <strong>말로 적어도 돼요.</strong> 키보드의 마이크 버튼을 누르고 말하면 글자로 들어가요
          </li>
          <li>종류와 말한 사람은 다음 줄까지 유지돼요. 매번 안 눌러도 돼요</li>
          <li>
            할 일에 <code>@이름</code> 을 붙이면 담당자가 자동으로 붙어요
          </li>
          <li>급하면 일단 적고, 나중에 줄을 눌러 종류를 바꾸면 돼요</li>
        </ul>
      </section>

      <section className="hlp__block">
        <h2>회의가 끝나면</h2>
        <ol className="hlp__steps">
          <li>회의 정보에서 <strong>폐회 기록</strong></li>
          <li>
            오른쪽 위 <strong>회의록</strong>
          </li>
          <li>
            <strong>결정·할 일만 복사</strong> → 카톡에 붙여넣기 (이게 제일 읽혀요)
            <br />
            또는 <strong>인쇄 · PDF</strong> → 인쇄 창에서 “PDF로 저장”
          </li>
        </ol>
      </section>

      <section className="hlp__block hlp__block--note">
        <h2>알아 둘 것</h2>
        <ul className="hlp__tips">
          <li>적은 줄은 바로 저장돼요. 앱이 꺼져도 남아요</li>
          <li>네트워크가 없어도 전부 돼요</li>
          <li>
            <strong>자료는 이 폰 안에만 있어요.</strong> 폰을 바꾸면 사라져요 — 중요한 회의록은 PDF 로
            저장하거나 카톡에 올려 두세요
          </li>
          <li>사파리 사생활 보호 창에서는 저장이 안 돼요</li>
        </ul>
      </section>

      <section className="hlp__block hlp__block--note">
        <h2>녹음을 앱이 해 주지 않는 이유</h2>
        <p className="hlp__lead">
          아이폰은 화면이 잠기거나 다른 앱으로 넘어가면 브라우저 녹음이 끊겨요. 1시간 회의를 거기
          맡기면 회의 하나를 통째로 날립니다. <strong>폰 기본 음성 메모가 안전해요.</strong> gonote 는
          그 녹음과 시각으로 맞물려서, 나중에 “이 결정이 녹음 23분쯤” 을 알려 줘요.
        </p>
      </section>
    </main>
  )
}
