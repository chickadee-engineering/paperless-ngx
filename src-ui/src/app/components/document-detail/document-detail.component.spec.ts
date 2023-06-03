import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Router, ActivatedRoute, convertToParamMap } from '@angular/router'
import { RouterTestingModule } from '@angular/router/testing'
import { of } from 'rxjs'
import { DocumentService } from 'src/app/services/rest/document.service'
import { DocumentDetailComponent } from './document-detail.component'
import { HttpClientTestingModule } from '@angular/common/http/testing'
import { DocumentTitlePipe } from 'src/app/pipes/document-title.pipe'
import { NgbModule } from '@ng-bootstrap/ng-bootstrap'
import { CorrespondentService } from 'src/app/services/rest/correspondent.service'
import { DocumentTypeService } from 'src/app/services/rest/document-type.service'
import { StoragePathService } from 'src/app/services/rest/storage-path.service'
import { UserService } from 'src/app/services/rest/user.service'
import { PaperlessDocument } from 'src/app/data/paperless-document'
import { PageHeaderComponent } from '../common/page-header/page-header.component'
import { OpenDocumentsService } from 'src/app/services/open-documents.service'
import { IfPermissionsDirective } from 'src/app/directives/if-permissions.directive'
import { PermissionsService } from 'src/app/services/permissions.service'
import { TagsComponent } from '../common/input/tags/tags.component'
import { SelectComponent } from '../common/input/select/select.component'
import { NgSelectModule } from '@ng-select/ng-select'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { TextComponent } from '../common/input/text/text.component'
import { NumberComponent } from '../common/input/number/number.component'
import { DateComponent } from '../common/input/date/date.component'
import { routes } from 'src/app/app-routing.module'

const doc: PaperlessDocument = {
  id: 3,
  title: 'Doc 3',
  correspondent: 11,
  document_type: 21,
  storage_path: 31,
  tags: [41, 42, 43],
  content: 'text content',
  added: new Date(),
  created: new Date(),
  archive_serial_number: null,
  original_file_name: 'file.pdf',
  owner: null,
  user_can_change: true,
  notes: [
    {
      created: new Date(),
      note: 'note 1',
      user: 1,
    },
    {
      created: new Date(),
      note: 'note 2',
      user: 2,
    },
  ],
}

describe('DocumentDetailComponent', () => {
  let component: DocumentDetailComponent
  let fixture: ComponentFixture<DocumentDetailComponent>
  let router: Router
  let activatedRoute: ActivatedRoute
  let documentService: DocumentService
  let openDocumentsService: OpenDocumentsService

  let currentUserCan = true
  let currentUserHasObjectPermissions = true
  let currentUserOwnsObject = true

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [
        DocumentDetailComponent,
        DocumentTitlePipe,
        PageHeaderComponent,
        IfPermissionsDirective,
        TagsComponent,
        SelectComponent,
        TextComponent,
        NumberComponent,
        DateComponent,
      ],
      providers: [
        DocumentTitlePipe,
        {
          provide: CorrespondentService,
          useValue: {
            listAll: () =>
              of({
                results: [
                  {
                    id: 11,
                    name: 'Correspondent11',
                  },
                ],
              }),
          },
        },
        {
          provide: DocumentTypeService,
          useValue: {
            listAll: () =>
              of({
                results: [
                  {
                    id: 21,
                    name: 'DocumentType21',
                  },
                ],
              }),
          },
        },
        {
          provide: StoragePathService,
          useValue: {
            listAll: () =>
              of({
                results: [
                  {
                    id: 31,
                    name: 'StoragePath31',
                  },
                ],
              }),
          },
        },
        {
          provide: UserService,
          useValue: {
            listAll: () =>
              of({
                results: [
                  {
                    id: 1,
                    username: 'user1',
                  },
                  {
                    id: 2,
                    username: 'user2',
                  },
                ],
              }),
          },
        },
        {
          provide: PermissionsService,
          useValue: {
            currentUserCan: () => currentUserCan,
            currentUserHasObjectPermissions: () =>
              currentUserHasObjectPermissions,
            currentUserOwnsObject: () => currentUserOwnsObject,
          },
        },
      ],
      imports: [
        RouterTestingModule.withRoutes(routes),
        HttpClientTestingModule,
        NgbModule,
        NgSelectModule,
        FormsModule,
        ReactiveFormsModule,
      ],
    }).compileComponents()

    router = TestBed.inject(Router)
    activatedRoute = TestBed.inject(ActivatedRoute)
    jest
      .spyOn(activatedRoute, 'paramMap', 'get')
      .mockReturnValue(of(convertToParamMap({ id: 3 })))
    openDocumentsService = TestBed.inject(OpenDocumentsService)
    documentService = TestBed.inject(DocumentService)
    fixture = TestBed.createComponent(DocumentDetailComponent)
    component = fixture.componentInstance
  })

  it('should load document via param', () => {
    jest.spyOn(documentService, 'get').mockReturnValueOnce(of(doc))
    jest.spyOn(openDocumentsService, 'getOpenDocument').mockReturnValue(null)
    jest
      .spyOn(openDocumentsService, 'openDocument')
      .mockReturnValueOnce(of(true))
    fixture.detectChanges() // calls ngOnInit
    expect(component.document).toEqual(doc)
  })

  it('should 404 on invalid id', () => {
    jest.spyOn(documentService, 'get').mockReturnValueOnce(of(null))
    const navigateSpy = jest.spyOn(router, 'navigate')
    fixture.detectChanges()
    expect(navigateSpy).toHaveBeenCalledWith(['404'])
  })
})
