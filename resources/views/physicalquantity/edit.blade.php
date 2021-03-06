@extends('layouts.app')

@section('page-title') {{ __('crud.edit', ['item'=>__('beep.physicalquantity')]) }}
@endsection

@section('content')
    @component('components/box')
        @slot('title')
            {{ __('crud.edit', ['item'=>__('beep.physicalquantity')]) }}
        @endslot

        @slot('bodyClass')
        @endslot

        @slot('body')

            <div class="row">
                <div class="col-md-12">
                        @if ($errors->any())
                            <ul class="alert alert-danger">
                                @foreach ($errors->all() as $error)
                                    <li>{{ $error }}</li>
                                @endforeach
                            </ul>
                        @endif

                        <form method="POST" action="{{ route('physicalquantity.update',$physicalquantity->id) }}" accept-charset="UTF-8" class="form-horizontal" enctype="multipart/form-data">
                            {{ method_field('PATCH') }}
                            {{ csrf_field() }}

                            @include ('physicalquantity.form', ['submitButtonText' => 'Update'])

                        </form>

                    </div>
                </div>
            </div>

      @endslot
    @endcomponent
@endsection
