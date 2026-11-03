import type { ReactNode } from 'react'
import { Col, Layout, Page, Row } from 'oa'

// A page's main column. Offcanvases go next to this, not inside it: Page shifts with a
// transform while one is open, which would stop it being fixed to the viewport
export function PageContent({ children }: { children: ReactNode }) {
  return (
    <Page>
      <Layout>
        {/* <Row>
          <Col md={9} lg={8} className="mx-auto mb-5"> */}
            {children}
          {/* </Col>
        </Row> */}
      </Layout>
    </Page>
  )
}
