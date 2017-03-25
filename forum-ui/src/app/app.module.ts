import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent, CommentDateFormatPipe, ArrayToCommaStringPipe, FilterPipe, GetCategoryNamePipe, RemoveBackSlashPipe, CreateEllipsisPipe, CreateTopicUrlPipe, GetChannelNamePipe, DecodeEmojisPipe } from './app.component';
import { HeaderComponent } from './header/header.component';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { RestApiComponent } from './restapi/restapi.component';
import { HomeComponent } from './home/home.component';
import {AppRoutingModule} from './app-routing.module';
import {HttpModule} from '@angular/http';
import {AuthorizationService} from './shared/authorization.service';
import {FormsModule} from '@angular/forms';
import { RightSidebarComponent } from './right-sidebar/right-sidebar.component';
import { CommentsComponent } from './comments/comments.component';
import { TopicDetailsComponent } from './topic-details/topic-details.component';
import { FeedComponent } from './feed/feed.component';
import { FeedsComponent } from './feeds/feeds.component';
import { DropdownDirective } from './shared/dropdown.directive';
import { FeedsService } from './services/feeds.service';
import { HttpClientModule } from '@angular/common/http';
import { AddCommentComponent } from './add-comment/add-comment.component';
import { AuthGuard } from './shared/auth.guard';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { CreateTopicComponent } from './create-topic/create-topic.component';
import { AddReplyComponent } from './add-reply/add-reply.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ReportComponent } from './report/report.component';
import { CommentModerationComponent } from './comment-moderation/comment-moderation.component';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { TopicListComponent } from './topic-list/topic-list.component';
import { CategoryListComponent } from './category-list/category-list.component';
import { DateRangePickerModule } from '@syncfusion/ej2-angular-calendars';
import {NgxPaginationModule} from 'ngx-pagination';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
import { GareportComponent } from './gareport/gareport.component';


@NgModule({
  declarations: [
    AppComponent,
    CommentDateFormatPipe,
    ArrayToCommaStringPipe,
    FilterPipe,
    RemoveBackSlashPipe,
    GetCategoryNamePipe,
    CreateEllipsisPipe,
    GetChannelNamePipe,
    DecodeEmojisPipe,
    CreateTopicUrlPipe,
    HeaderComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    RestApiComponent,
    RightSidebarComponent,
    CommentsComponent,
    TopicDetailsComponent,
    FeedComponent,
    FeedsComponent,
    DropdownDirective,
    AddCommentComponent,
    ForgotPasswordComponent,
    CreateTopicComponent,
    AddReplyComponent,
    UserProfileComponent,
    ReportComponent,
    CommentModerationComponent,
    TopicListComponent,
    CategoryListComponent,
    GareportComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpModule,
    FormsModule,
    HttpClientModule,
    AngularEditorModule,
    DateRangePickerModule,
    NgxPaginationModule,
    AngularMultiSelectModule,
    NgMultiSelectDropDownModule.forRoot()
  ],
  providers: [
    AuthorizationService,
    FeedsService,
    AuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
