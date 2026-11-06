import type { ReactNode } from 'react'
import { Col, Layout, Page, Row } from 'oa'

type PageContentProps = {
  children: ReactNode
  // Full width above children and the sidebar
  header?: ReactNode
  // A column to the right of children from lg up, stacked under them below that
  sidebar?: ReactNode
}

// A page's main column. Offcanvases go next to this, not inside it: Page shifts with a
// transform while one is open, which would stop it being fixed to the viewport
export function PageContent({ children, header, sidebar }: PageContentProps) {
  return (
    <Page>
      <Layout>
        {header}
        {sidebar ? (
          <Row>
            <Col lg={8}>
              {children}
            </Col>
            <Col as="aside" lg={4}>
              {sidebar}
            </Col>
          </Row>
        ) : (
          children
        )}
      </Layout>
    </Page>
  )
}
